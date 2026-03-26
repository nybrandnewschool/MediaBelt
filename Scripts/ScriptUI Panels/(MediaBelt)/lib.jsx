var Metadata = {
  name: "MediaBelt",
  author: "Dan Bradham",
  version: "26.0.2",
};

/** Get user data folder. */
function get_user_data_folder() {
  var folder = Folder(Folder.userData.fsName + "/" + Metadata.name);
  if (!folder.exists) {
    folder.create();
  }
  return folder;
}

/** Get user data file. */
function get_user_data_file(filename) {
  return File(get_user_data_folder().fsName + "/" + filename);
}

/**
 * Returns true if the item is a CompItem.
 * @param {Item} item - The item to check.
 * @returns {boolean} - True if the item is a CompItem.
 */
function is_CompItem(item) {
  return item instanceof CompItem;
}

/**
 * Returns true if the item is a FootageItem.
 * @param {Item} item - The item to check.
 * @returns {boolean} - True if the item is a FootageItem.
 */
function is_FootageItem(item) {
  return item instanceof FootageItem;
}

/**
 * Returns true if the item is an AVItem (FootageItem or CompItem).
 * @param {Item} item - The item to check.
 * @returns {boolean} - True if the item is an AVItem.
 */
function is_AVItem(item) {
  return item instanceof FootageItem || item instanceof CompItem;
}

/**
 * Checks if a given name and path represent a sequence.
 * @param {string} name - The name of the item.
 * @param {string} path - The file path of the item.
 * @returns {boolean} - Returns true if the name or path indicates a sequence, otherwise false.
 */
function is_image_sequence(name, path) {
  var matches = name.match(/\[\d+\-\d+\]/g);
  if (matches && matches.length > 0) {
    return true;
  }

  var matches = path.match(/\.\d+\./g);
  return matches && matches.length > 0;
}

/**
 * Pads a number to a specified length with leading zeros.
 * @param {number} padding - The desired length of the number.
 * @param {number} number - The number to be padded.
 * @returns {string} - The padded number as a string.
 */
function pad(padding, number) {
  var number_str = number.toString();
  var result = "";
  while (result.length < padding - number_str.length) {
    result += "0";
  }
  return result + number_str;
}

/**
 * Changes the version of a footage item by a given step.
 * @param {FootageItem} item - The footage item to update.
 * @param {number} step - The step value to increment or decrement the version by.
 */
function change_footage_version(item, step) {
  source_path = item.file.fsName;
  var matches = source_path.match(/v(\d+)/g);

  if (!matches || matches.length === 0) {
    return;
  }

  var last_match = matches[matches.length - 1];
  var version_padding = last_match.length - 1;
  var version_number = parseInt(last_match.replace(/v/, ""), 10);
  var version_regex = new RegExp(last_match, "g");

  for (var i = 1; i < 10; i++) {
    var new_version = pad(
      version_padding,
      Math.max(0, version_number + i * step),
    );
    var new_source_path = source_path.replace(version_regex, "v" + new_version);
    var new_source_file = File(new_source_path);
    if (new_source_file.exists) {
      break;
    }

    // Check if the source folder we are looking for exists....
    var new_source_folder = new_source_file.parent;
    if (!new_source_folder.exists) {
      continue;
    }

    // Find first frame if we didn't hit a frame in the last attempt
    // Build a filename pattern that we can use to find a file.
    var frame_matches = new_source_path.match(/[_.](\d+)[_.]/);
    if (!frame_matches || matches.length === 0) {
      continue;
    }

    var last_frame_match = frame_matches[frame_matches.length - 1];
    var last_frame_regex = new RegExp(last_frame_match, "g");
    var filename_pattern = new_source_file.name.replace(last_frame_regex, "*");

    var new_source_files = new_source_folder
      .getFiles(filename_pattern)
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    if (new_source_files.length === 0) {
      continue;
    }

    // Iterate over files in next version directory
    // to find a frame we can use to import.
    for (var i = 0; i < new_source_files.length; i++) {
      var new_source_file = new_source_files[i];
      if (new_source_file.name.match(filename_pattern)) {
        break;
      }
    }
  }

  if (!new_source_file.exists) {
    return;
  }

  if (item.mainSource.isStill) {
    item.replace(new_source_file);
  } else if (is_image_sequence(item.file.name, item.file.fsName)) {
    item.replaceWithSequence(new_source_file, false);
  } else {
    item.replace(new_source_file);
  }
}

/**
 * Changes the version of a comp item by a given step.
 * @param {CompItem} item - The comp item to update.
 * @param {number} step - The step value to increment or decrement the version by.
 */
function change_comp_version(item, step) {
  item_name = item.name;
  var matches = item_name.match(/v(\d+)/g);

  if (!matches || matches.length === 0) {
    return;
  }

  var last_match = matches[matches.length - 1];
  var version_padding = last_match.length - 1;
  var version_number = parseInt(last_match.replace(/v/, ""), 10);
  var version_regex = new RegExp(last_match, "g");
  var new_version = pad(version_padding, Math.max(0, version_number + step));
  var new_item_name = item_name.replace(version_regex, "v" + new_version);

  item.name = new_item_name;
}

/**
 * Changes the version of all selected items by a given step.
 * @param {number} step - The step value to increment or decrement the version by.
 */
function change_selected_item_versions(step) {
  app.beginUndoGroup("change_selected_item_version");
  var selected_items = app.project.selection;
  for (var i = 0; i < selected_items.length; i++) {
    item = selected_items[i];
    if (is_FootageItem(item)) {
      change_footage_version(item, step);
    }
    if (is_CompItem(item)) {
      change_comp_version(item, step);
    }
  }
  app.endUndoGroup();
}

/**
 * Search and replace in an item's name.
 * @param {string} search - The search string to replace.
 * @param {string} replace - The replacement string.
 */
function search_replace_selected_items(search, replace) {
  app.beginUndoGroup("search_replace_selected_items");
  var selected_items = app.project.selection;
  for (var i = 0; i < selected_items.length; i++) {
    item = selected_items[i];
    if (is_AVItem(item)) {
      var new_name = item.name.replace(search, replace);
      item.name = new_name;
    }
  }
  app.endUndoGroup();
}

/**
 * Add a prefix to an item's name.
 * @param {string} prefix - The prefix to add.
 */
function prefix_selected_items(prefix) {
  app.beginUndoGroup("prefix_selected_items");
  var selected_items = app.project.selection;
  for (var i = 0; i < selected_items.length; i++) {
    item = selected_items[i];
    if (is_AVItem(item)) {
      var new_name = prefix + item.name;
      item.name = new_name;
    }
  }
  app.endUndoGroup();
}

/**
 * Add a suffix to an item's name.
 * @param {string} suffix - The suffix to add.
 */
function suffix_selected_items(suffix) {
  app.beginUndoGroup("suffix_selected_items");

  var selected_items = app.project.selection;
  for (var i = 0; i < selected_items.length; i++) {
    item = selected_items[i];
    if (is_AVItem(item)) {
      var new_name = item.name + suffix;
      item.name = new_name;
    }
  }

  app.endUndoGroup();
}

/**
 * Apply settings to selected comp items.
 * @param {object} settings - The settings to apply.
 * Example Settings:
 * {
 *    width: 1920,
 *    height: 1080,
 *    frameRate: 30,
 *    startFrame: 1,
 *    duration: 120,
 * }
 */
function apply_comp_settings(settings) {
  app.beginUndoGroup("apply_comp_settings");

  var selected_items = app.project.selection;
  for (var i = 0; i < selected_items.length; i++) {
    item = selected_items[i];
    if (is_CompItem(item)) {
      if ("width" in settings) {
        item.width = settings.width;
      }
      if ("height" in settings) {
        item.height = settings.height;
      }
      if ("frameRate" in settings) {
        item.frameRate = settings.frameRate;
      }
      if ("startFrame" in settings) {
        item.displayStartFrame = settings.startFrame;
      }
      if ("duration" in settings) {
        item.duration = settings.duration * item.frameDuration;
      }
    }
  }

  app.endUndoGroup();
}

/**
 * Returns the settings of a comp item as an object.
 * @param {CompItem} item - The comp item to get settings from.
 * @returns {Object} - The settings of the comp item.
 */
function item_get_settings(item) {
  // AVItem settings
  var settings = {
    width: item.width,
    height: item.height,
    frameRate: Number(item.frameRate.toFixed(4)),
    duration: Math.floor(item.duration * item.frameRate),
    startFrame: 0,
  };

  // CompItem settings
  if (is_CompItem(item)) {
    settings.startFrame = item.displayStartFrame;
  }
  return settings;
}

/**
 * Returns the file object for the comp clipboard file.
 * @returns {File} - The file object for the comp clipboard file.
 */
function comp_clipboard_file() {
  return get_user_data_file("comp_clipboard.json");
}

/**
 * Copies the settings of the selected comp item to the clipboard.
 */
function comp_clipboard_copy() {
  var selected_items = app.project.selection;
  if (selected_items.length === 0) return;

  var item = selected_items[0];
  if (is_AVItem(item)) {
    var settings = item_get_settings(item);
    var file = comp_clipboard_file();
    file.open("w");
    file.write(JSON.stringify(settings));
    file.close();
    return settings;
  }
}

/**
 * Pastes the settings from the clipboard to the selected comp items.
 */
function comp_clipboard_paste() {
  var file = comp_clipboard_file();
  file.open("r");
  var settings = JSON.parse(file.read());
  file.close();
  apply_comp_settings(settings);
}
