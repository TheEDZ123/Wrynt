/*global define, brackets, $ */

// See detailed docs in https://github.com/phcode-dev/phoenix/wiki/How-To-Write-Extensions-And-Themes
// A good place to look for code examples for extensions: https://github.com/phcode-dev/phoenix/tree/main/src/extensions/default

// A simple extension that adds an entry in "file menu> hello world"
define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    const AppInit = brackets.getModule("utils/AppInit"),
        DefaultDialogs = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        CommandManager = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        EditorManager = brackets.getModule("editor/EditorManager");

    var prefs = PreferencesManager.getExtensionPrefs("wallpaper"),
        moduleThemesDir = ExtensionUtils.getModulePath(module, "wallpaper/");

    prefs.on("change", function(e, data) {
      var i = 0, wallpaper;
      console.log("Wanderlust: Preferences Changed");
      for (i = 0; i < data.ids.length; i++) {
        console.log("Wanderlust: " + data.ids[i] + ": " + data.values[i]);
        if (data.ids[i] === "wallpaper") {
          wallpaper = data.values[i];
          break;
        }
      }
    });


    // Create a function that retrieves the image link stored within the wallpaper
    // directory of the extension and uses it to set the image content of a
    // div element
    function setWallpaper() {
        var dir = FileSystem.getDirectoryForPath(moduleThemesDir, function (err, dir) {
            if (err) {
                console.log(err);
                return;
            }
            dir.readEntries(function (err, entries) {
                if (err) {
                    console.log(err);
                    return;
                }
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isFile) {
                        var name = entries[i].name;
                        var link = moduleThemesDir + name;
                        $("#wallpaper").css("background-image", "url(" + link + ")");
                        $("#wallpaper").css("opacity", "1");
                    }
                }
            })
        })
    }

    // Handle the opening of the menu item with a dialog box
    // that allow the user to upload an image
    function handleMenu() {
        DefaultDialogs.showDialog(
            Dialogs.DIALOG_ID_INFO,
            "Wallpaper",
            "Upload wallpaper",
            "Upload",
            "Cancel",
            null,
            null,
            null
        );
    }

    // First, register a command - a UI-less object associating an id to a handler
    var MENU_COMMAND_ID = "Wanderlust.handleMenu";
    CommandManager.register("Opening Menu", MENU_COMMAND_ID, handleMenu);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID);

    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-W");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)

    // Initialize extension once shell is finished initializing.

    // Create a function that creates a wallpaper div element within the 
    // Code Mirror element positioned towards the back of the editor 
    // and sets all other background colors to transparent
    function createWallpaper() {
        var div = document.createElement("div");
        div.id = "wallpaper";
        div.style.position = "absolute";
        div.style.top = "0";
        div.style.left = "0";
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.backgroundSize = "cover";
        div.style.backgroundRepeat = "no-repeat";
        div.style.zIndex = "0";
        div.style.opacity = "0.5";
        div.style.pointerEvents = "none";
        document.querySelector(".CodeMirror").appendChild(div);
    }

    // Handle the opening of the extension menu with a ui that allow the user
    // to upload a wallpaper to the wallpaper directory and set it as the wallpaper
    // while allowing them to control the opacity of the wallpaper and set the
    // background color
    AppInit.appReady(function () {
        createWallpaper();
        setWallpaper();
        $("#wallpaper").css("background-color", prefs.get("background-color"));
        $("#wallpaper").css("opacity", prefs.get("opacity"));
        $("#wallpaper").css("pointer-events", "auto");
        $("#wallpaper").on("click", function () {
            var color = $("#wallpaper").css("background-color");
            var opacity = $("#wallpaper").css("opacity");
            prefs.set("background-color", color);
            prefs.set("opacity", opacity);
            setWallpaper();
            $("#wallpaper").css("background-color", prefs.get("background-color"));
            $("#wallpaper").css("opacity", prefs.get("opacity"));
            $("#wallpaper").css("cursor", "auto");
            $("#wallpaper").css("pointer-events", "none");
            $("#wallpaper").off("mouseover");
            $("#wallpaper").off("mouseout");
            $("#wallpaper").off("click");
            $("#wallpaper").on("mouseover", function () {
                $("#wallpaper").css("cursor", "pointer");
            });
        });
        console.log("Wanderlust loaded");
    });
});
