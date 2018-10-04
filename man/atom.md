# Atom editor integration

These are just suggestions for an emacs addict who wants to try Atom editor.

Packages to install:
* __atom-macros__: Allow to define quick functions you can assign to keys.
* __atom-keyboard-macros__: Recording macro like the F3/F4 in Emacs. Here you will use `Ctrl-X (` to start recording, `Ctrl-x )`
to end recording and `Ctrl-x e` to execute it.
* __language-toloframework-xjs__: Grammar for XJS files.

Then go to he menu `Packages -> Macros -> Edit macro definitions` and put this in the opened file:
```coffee
`
function getActivePathAndExtension() {
  var activeEditor = atom.workspace.getActiveTextEditor();
  if( !activeEditor ) return null;
  var path = activeEditor.getPath();
  var dotPos = path.lastIndexOf( '.' );
  if( dotPos < 0 ) return null;
  return { ext: path.substr( dotPos ), path: path.substr( 0, dotPos ) };
}

function switchTo( ext ) {
  var info = getActivePathAndExtension();
  if( !info ) return;
  atom.workspace.open( info.path + ext );
}

this.tfwSwitchToJS = function() { switchTo( '.js' ); }
this.tfwSwitchToXJS = function() { switchTo( '.xjs' ); }
this.tfwSwitchToCSS = function() { switchTo( '.css' ); }
this.tfwSwitchToINI = function() { switchTo( '.ini' ); }
this.tfwSwitchToDEP = function() { switchTo( '.dep' ); }
this.tfwSwitchToVERT = function() { switchTo( '.vert' ); }
this.tfwSwitchToFRAG = function() { switchTo( '.frag' ); }
`
```

To get usefull key bindings to switch between JS, XJS, CSS, ... Go to the menu `File -> Keymap` and put this in the opened file:
```coffee
'atom-text-editor':
  'alt--': 'editor:fold-all'
  'alt-+': 'editor:unfold-all'
  'ctrl--': 'editor:fold-current-row'
  'ctrl-+': 'editor:unfold-current-row'
  'f12 j': 'macros:tfwSwitchToJS'
  'f12 x': 'macros:tfwSwitchToXJS'
  'f12 c': 'macros:tfwSwitchToCSS'
  'f12 i': 'macros:tfwSwitchToINI'
  'f12 d': 'macros:tfwSwitchToDEP'
  'f12 v': 'macros:tfwSwitchToVERT'
  'f12 f': 'macros:tfwSwitchToFRAG'
```
