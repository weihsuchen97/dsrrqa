use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};

// ── Windows 全域滑鼠鉤子（全螢幕模式點擊觸發魚逃跑）────────────────────────
#[cfg(windows)]
mod hook {
    use std::sync::OnceLock;
    use std::sync::atomic::{AtomicU32, Ordering};
    use std::ptr;
    use tauri::Emitter;
    use winapi::um::winuser::*;

    static APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();
    static HOOK_THREAD_ID: AtomicU32 = AtomicU32::new(0);

    // HHOOK 是原始指標，需要 newtype 讓它可以跨執行緒傳遞
    struct HookPtr(*mut winapi::shared::windef::HHOOK__);
    unsafe impl Send for HookPtr {}

    #[derive(serde::Serialize, Clone)]
    struct Payload { x: i32, y: i32 }

    unsafe extern "system" fn mouse_proc(n_code: i32, w_param: usize, l_param: isize) -> isize {
        if n_code >= 0 && w_param == WM_LBUTTONDOWN as usize {
            let ms = &*(l_param as *const MSLLHOOKSTRUCT);
            if let Some(app) = APP_HANDLE.get() {
                let _ = app.emit("fish-click", Payload { x: ms.pt.x, y: ms.pt.y });
            }
        }
        CallNextHookEx(ptr::null_mut(), n_code, w_param, l_param)
    }

    pub fn init(app: tauri::AppHandle) {
        let _ = APP_HANDLE.set(app);
    }

    pub fn install() {
        if HOOK_THREAD_ID.load(Ordering::Relaxed) != 0 {
            return; // 已安裝，不重複
        }
        std::thread::spawn(|| unsafe {
            let hook = SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_proc), ptr::null_mut(), 0);
            if hook.is_null() { return; }
            let tid = winapi::um::processthreadsapi::GetCurrentThreadId();
            HOOK_THREAD_ID.store(tid, Ordering::Relaxed);
            let hook_ptr = HookPtr(hook);
            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
            UnhookWindowsHookEx(hook_ptr.0);
            HOOK_THREAD_ID.store(0, Ordering::Relaxed);
        });
    }

    pub fn uninstall() {
        let tid = HOOK_THREAD_ID.load(Ordering::Relaxed);
        if tid != 0 {
            unsafe { PostThreadMessageW(tid, WM_QUIT, 0, 0); }
        }
    }
}

fn close_overlay(app: &tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.close();
    }
    #[cfg(windows)]
    hook::uninstall();
}

fn show_and_focus(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}

#[tauri::command]
async fn show_main_window(app: tauri::AppHandle) {
    show_and_focus(&app);
}

#[tauri::command]
async fn quit_app(app: tauri::AppHandle) {
    close_overlay(&app);
    app.exit(0);
}

#[tauri::command]
async fn create_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.show().map_err(|e| e.to_string())?;
        return Ok(());
    }

    // 取得主視窗所在螢幕（支援雙螢幕）
    let main_win = app
        .get_webview_window("main")
        .ok_or("main window not found")?;

    let monitor = main_win
        .current_monitor()
        .map_err(|e| e.to_string())?
        .or_else(|| app.primary_monitor().ok().flatten())
        .ok_or("no monitor found")?;

    let pos = monitor.position();
    let size = monitor.size();

    let window = WebviewWindowBuilder::new(
        &app,
        "overlay",
        WebviewUrl::App("index.html#overlay".into()),
    )
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .inner_size(size.width as f64, size.height as f64)
    .position(pos.x as f64, pos.y as f64)
    .build()
    .map_err(|e| e.to_string())?;

    // 修正 A：OS 層穿透，讓桌面可正常點擊
    window
        .set_ignore_cursor_events(true)
        .map_err(|e| e.to_string())?;

    #[cfg(windows)]
    hook::install();

    Ok(())
}

#[tauri::command]
async fn destroy_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    close_overlay(&app);
    Ok(())
}

#[tauri::command]
async fn check_overlay_exists(app: tauri::AppHandle) -> bool {
    app.get_webview_window("overlay").is_some()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // 初始化滑鼠鉤子的 AppHandle（鉤子只在開啟 overlay 時才安裝）
            #[cfg(windows)]
            hook::init(app.handle().clone());

            // 修正 C：托盤選單簡化為「顯示 / 關閉」
            let show_item = MenuItem::with_id(app, "show", "顯示", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "關閉", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                // 修正 C：托盤左鍵單擊 → 顯示並聚焦視窗
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        show_and_focus(tray.app_handle());
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_and_focus(app),
                    "quit" => {
                        close_overlay(app);
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // 主視窗關閉請求時同步關閉 overlay
            if let Some(main_win) = app.get_webview_window("main") {
                let app_handle = app.handle().clone();
                main_win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { .. } = event {
                        close_overlay(&app_handle);
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_main_window,
            quit_app,
            create_overlay_window,
            destroy_overlay_window,
            check_overlay_exists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
