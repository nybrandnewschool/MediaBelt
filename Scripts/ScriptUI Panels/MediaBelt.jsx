#include "(MediaBelt)/lib.jsx"


(function Belt(thisObj) {
  function init(thisObj) {
    /* Build UI */
    var ui =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Media Belt", undefined, { resizable: true });
    ui.title = "Media Belt";
    ui.onResizing = ui.onResize = function () {
      thisObj.layout.resize();
    };

    var version_panel = ui.add("panel", undefined, "Version");
    version_panel.orientation = "column";
    version_panel.alignment = ["fill", "top"];

    var version_row = version_panel.add("group", undefined, "Version Row");
    version_row.orientation = "row";
    version_row.alignChildren = ["fill", ""];

    var button_version_down = version_row.add("button", undefined, "Down");
    button_version_down.alignment = "left";
    button_version_down.onClick = function () {
      change_selected_item_versions(-1);
    };

    var button_version_up = version_row.add("button", undefined, "Up");
    button_version_up.alignment = "left";
    button_version_up.onClick = function () {
      change_selected_item_versions(1);
    };

    var re_panel = ui.add("panel", undefined, "Rename");
    re_panel.orientation = "column";
    re_panel.alignment = ["fill", "top"];
    re_panel.alignChildren = ["fill", ""];

    var sre_row = re_panel.add("group", undefined, "SRE Row");
    sre_row.orientation = "row";
    sre_row.alignChildren = ["fill", ""];

    var sre_label = sre_row.add("statictext", undefined, "Search Replace");
    sre_label.preferredSize.width = 75;
    sre_label.alignment = "left";
    sre_label.justify = "right";

    var sre_search = sre_row.add("edittext", undefined, "");

    var sre_replace = sre_row.add("edittext", undefined, "");

    var button_sre_apply = sre_row.add("button", undefined, "Apply");
    button_sre_apply.maximumSize.width = 75;
    button_sre_apply.minimumSize.width = 75;
    button_sre_apply.alignment = ["right", ""];
    button_sre_apply.onClick = function () {
      search_replace_selected_items(sre_search.text, sre_replace.text);
    };

    var prefix_row = re_panel.add("group", undefined, "Prefix Row");
    prefix_row.orientation = "row";
    prefix_row.alignChildren = ["fill", ""];

    var prefix_label = prefix_row.add("statictext", undefined, "Prefix");
    prefix_label.preferredSize.width = 75;
    prefix_label.alignment = "left";
    prefix_label.justify = "right";

    var prefix_edit = prefix_row.add("edittext", undefined, "");

    var button_prefix_apply = prefix_row.add("button", undefined, "Apply");
    button_prefix_apply.maximumSize.width = 75;
    button_prefix_apply.minimumSize.width = 75;
    button_prefix_apply.alignment = ["right", ""];
    button_prefix_apply.onClick = function () {
      prefix_selected_items(prefix_edit.text);
    };

    var suffix_row = re_panel.add("group", undefined, "Suffix Row");
    suffix_row.orientation = "row";
    suffix_row.alignChildren = ["fill", ""];

    var suffix_label = suffix_row.add("statictext", undefined, "Suffix");
    suffix_label.preferredSize.width = 75;
    suffix_label.justify = "right";
    suffix_label.alignment = "left";

    var suffix_edit = suffix_row.add("edittext", undefined, "");

    var button_suffix_apply = suffix_row.add("button", undefined, "Apply");
    button_suffix_apply.maximumSize.width = 75;
    button_suffix_apply.minimumSize.width = 75;
    button_suffix_apply.alignment = ["right", ""];
    button_suffix_apply.onClick = function () {
      suffix_selected_items(suffix_edit.text);
    };

    var comp_panel = ui.add("panel", undefined, "Composition");
    comp_panel.orientation = "column";
    comp_panel.alignment = ["fill", "top"];
    comp_panel.alignChildren = ["fill", ""];

    var res_row = comp_panel.add("group", undefined, "Resolution Row");
    res_row.orientation = "row";
    res_row.alignChildren = ["fill", ""];

    var res_label = res_row.add("statictext", undefined, "Resolution");
    res_label.preferredSize.width = 75;
    res_label.justify = "right";
    res_label.alignment = "left";

    var res_width_edit = res_row.add("edittext", undefined, "");
    res_width_edit.text = "3840";

    var res_height_edit = res_row.add("edittext", undefined, "");
    res_height_edit.text = "2160";

    var button_res_apply = res_row.add("button", undefined, "Apply");
    button_res_apply.maximumSize.width = 75;
    button_res_apply.minimumSize.width = 75;
    button_res_apply.alignment = ["right", ""];
    button_res_apply.onClick = function () {
      apply_comp_settings({width: parseInt(res_width_edit.text), height: parseInt(res_height_edit.text)});
    };

    var fps_row = comp_panel.add("group", undefined, "FPS Row");
    fps_row.orientation = "row";
    fps_row.alignChildren = ["fill", ""];

    var fps_label = fps_row.add("statictext", undefined, "Frame Rate");
    fps_label.preferredSize.width = 75;
    fps_label.justify = "right";
    fps_label.alignment = "left";

    var fps_dropdown = fps_row.add("dropdownlist", undefined, [
      "8",
      "12",
      "15",
      "23.976",
      "23.98",
      "24",
      "25",
      "29.97",
      "30",
      "50",
      "59.94",
      "60",
      "120",
    ]);
    fps_dropdown.selection = 7;

    var button_fps_apply = fps_row.add("button", undefined, "Apply");
    button_fps_apply.maximumSize.width = 75;
    button_fps_apply.minimumSize.width = 75;
    button_fps_apply.alignment = ["right", ""];
    button_fps_apply.onClick = function () {
      apply_comp_settings({frameRate: parseFloat(fps_dropdown.selection.text)});
    };

    var sframe_row = comp_panel.add("group", undefined, "Start Frame Row");
    sframe_row.orientation = "row";
    sframe_row.alignChildren = ["fill", ""];

    var sframe_label = sframe_row.add("statictext", undefined, "Start Frame");
    sframe_label.preferredSize.width = 75;
    sframe_label.justify = "right";
    sframe_label.alignment = "left";

    var sframe_edit = sframe_row.add("edittext", undefined, "");
    sframe_edit.text = "1";

    var button_sframe_apply = sframe_row.add("button", undefined, "Apply");
    button_sframe_apply.maximumSize.width = 75;
    button_sframe_apply.minimumSize.width = 75;
    button_sframe_apply.alignment = ["right", ""];
    button_sframe_apply.onClick = function () {
      apply_comp_settings({startFrame: parseFloat(sframe_edit.text)});
    };

    var duration_row = comp_panel.add("group", undefined, "Duration Row");
    duration_row.orientation = "row";
    duration_row.alignChildren = ["fill", ""];

    var duration_label = duration_row.add("statictext", undefined, "Duration (f)");
    duration_label.preferredSize.width = 75;
    duration_label.justify = "right";
    duration_label.alignment = "left";

    var duration_edit = duration_row.add("edittext", undefined, "");
    duration_edit.text = "120";

    var button_duration_apply = duration_row.add("button", undefined, "Apply");
    button_duration_apply.maximumSize.width = 75;
    button_duration_apply.minimumSize.width = 75;
    button_duration_apply.alignment = ["right", ""];
    button_duration_apply.onClick = function () {
      apply_comp_settings({duration: parseFloat(duration_edit.text)});
    };

    var comp_button_row = comp_panel.add("group", undefined, "Comp Button Row");
    comp_button_row.orientation = "row";
    comp_button_row.alignChildren = ["right", ""];

    var button_comp_copy = comp_button_row.add("button", undefined, "Copy from Selected");
    button_comp_copy.alignment = ["right", ""];
    button_comp_copy.onClick = function () {
      settings = comp_clipboard_copy();
      res_width_edit.text = settings.width;
      res_height_edit.text = settings.height;
      // Set dropdown item from text
      for (var i = 0; i < fps_dropdown.items.length; i++) {
        if (fps_dropdown.items[i].text === settings.frameRate.toString()) {
          fps_dropdown.selection = i;
          break;
        }
      }
      sframe_edit.text = settings.startFrame;
      duration_edit.text = settings.duration;
    };

    var button_comp_apply = comp_button_row.add("button", undefined, "Apply All");
    button_comp_apply.maximumSize.width = 75;
    button_comp_apply.minimumSize.width = 75;
    button_comp_apply.alignment = ["right", ""];
    button_comp_apply.onClick = function () {
      var settings = {
        width: parseInt(res_width_edit.text),
        height: parseInt(res_height_edit.text),
        frameRate: parseFloat(fps_dropdown.selection.text),
        startFrame: parseFloat(sframe_edit.text),
        duration: parseFloat(duration_edit.text),
      };
      apply_comp_settings(settings);
    };

    return ui;
  }

  /* Initialize UI */
  ui = init(thisObj);
  if (ui instanceof Panel) {
    ui.layout.layout(true);
    ui.layout.resize();
  } else {
    ui.center();
    ui.show();
  }
})(this);
