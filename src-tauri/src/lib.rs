use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};

// ── 跨平台全域滑鼠鉤子（Windows/macOS，全螢幕模式點擊觸發魚逃跑）────────────
mod hook {
    use std::sync::OnceLock;
    use std::sync::atomic::{AtomicBool, AtomicI32, AtomicU64, Ordering};
    use tauri::Emitter;
    use rdev::{listen, Event, EventType, Button};

    static APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();
    static ACTIVE: AtomicBool = AtomicBool::new(false);
    // 螢幕偏移量（實體像素）與縮放比，用來把全域座標轉成 overlay-local 邏輯座標
    static MONITOR_X: AtomicI32 = AtomicI32::new(0);
    static MONITOR_Y: AtomicI32 = AtomicI32::new(0);
    static MONITOR_SCALE: AtomicU64 = AtomicU64::new(0);
    // 追蹤最後已知滑鼠位置（rdev ButtonPress 不帶座標）
    static MOUSE_X: AtomicU64 = AtomicU64::new(0);
    static MOUSE_Y: AtomicU64 = AtomicU64::new(0);

    #[derive(serde::Serialize, Clone)]
    struct Payload { x: f64, y: f64 }

    pub fn init(app: tauri::AppHandle) {
        let _ = APP_HANDLE.set(app);
    }

    pub fn set_monitor(x: i32, y: i32, scale: f64) {
        MONITOR_X.store(x, Ordering::Relaxed);
        MONITOR_Y.store(y, Ordering::Relaxed);
        MONITOR_SCALE.store(scale.to_bits(), Ordering::Relaxed);
    }

    pub fn install() {
        if ACTIVE.swap(true, Ordering::Relaxed) { return; }
        std::thread::spawn(|| {
            let _ = listen(move |event: Event| {
                match event.event_type {
                    EventType::MouseMove { x, y } => {
                        MOUSE_X.store(x.to_bits(), Ordering::Relaxed);
                        MOUSE_Y.store(y.to_bits(), Ordering::Relaxed);
                    }
                    EventType::ButtonPress(Button::Left) => {
                        if !ACTIVE.load(Ordering::Relaxed) { return; }
                        if let Some(app) = APP_HANDLE.get() {
                            let ox = MONITOR_X.load(Ordering::Relaxed);
                            let oy = MONITOR_Y.load(Ordering::Relaxed);
                            let scale = f64::from_bits(MONITOR_SCALE.load(Ordering::Relaxed));
                            let mx = f64::from_bits(MOUSE_X.load(Ordering::Relaxed));
                            let my = f64::from_bits(MOUSE_Y.load(Ordering::Relaxed));
                            // Windows: rdev 給實體像素，需減偏移再除以 scale
                            // macOS:   rdev 給邏輯點，需減邏輯偏移（offset / scale）
                            #[cfg(target_os = "windows")]
                            let (x, y) = ((mx - ox as f64) / scale, (my - oy as f64) / scale);
                            #[cfg(not(target_os = "windows"))]
                            let (x, y) = (mx - ox as f64 / scale, my - oy as f64 / scale);
                            let _ = app.emit("fish-click", Payload { x, y });
                        }
                    }
                    _ => {}
                }
            });
        });
    }

    pub fn uninstall() {
        ACTIVE.store(false, Ordering::Relaxed);
    }
}

fn close_overlay(app: &tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.close();
    }
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
    let scale = monitor.scale_factor();

    let window = WebviewWindowBuilder::new(
        &app,
        "overlay",
        WebviewUrl::App("index.html#overlay".into()),
    )
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .inner_size(size.width as f64 / scale, size.height as f64 / scale)
    .position(pos.x as f64, pos.y as f64)
    .build()
    .map_err(|e| e.to_string())?;

    // 修正 A：OS 層穿透，讓桌面可正常點擊
    window
        .set_ignore_cursor_events(true)
        .map_err(|e| e.to_string())?;

    hook::set_monitor(pos.x, pos.y, scale);
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

            // 按 X 時隱藏到托盤，而非真正關閉
            if let Some(main_win) = app.get_webview_window("main") {
                let app_handle = app.handle().clone();
                main_win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.hide();
                        }
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
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            // macOS：點擊 Dock 圖示時，恢復顯示主視窗
            if let tauri::RunEvent::Reopen { .. } = event {
                show_and_focus(app_handle);
            }
        });
}
