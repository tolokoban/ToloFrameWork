/**
 * @example
 * <wdg.button">
 *   <wdg:text att="text" $label="Text to display" $value="OK" />
 *   <wdg:checkbox att="wait" $label="Wait animation" $value="false" />
 * </wdg.button>
 */

exports.tags = ["wdg\\..+"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
  var name = root.name;
  var widgetAttributes = root.attribs || {};
  var panel1 = { type: libs.Tree.TAG, name: "div", attribs: { style: 'width: 320px' }, children: [] };
  var panel2 = { type: libs.Tree.TAG, name: "div", attribs: { 'class': 'flex-grow1' }, children: [] };
  var center = { type: libs.Tree.TAG, name: "center", children: [] };
  var children = [{
    type: libs.Tree.TAG, name: "div", attribs: { 'class': 'preview' }, children: [panel1, panel2]
  }];
  var code = {
    type: libs.Tree.TAG,
    name: 'code',
    attribs: { 'class': 'code' },
    children: [{
      type: libs.Tree.TEXT, text: '<wdg:' + name.substr( 4 )
    }]
  };
  root.children.forEach(function (child) {
    if( child.type !== libs.Tree.TAG ) return;
    if( !child.attribs ) return;
    if( typeof child.attribs.att === 'string' ) {
      child.attribs.id = "att-" + child.attribs.att;
      widgetAttributes['bind:' + child.attribs.att] = child.attribs.id + ":value";
      widgetAttributes['$' + child.attribs.att] = child.attribs.$value;
      var attribs = {
        'class': 'value thm-fgP',
        $value: child.attribs.$value
      };
      attribs['bind:value'] = child.attribs.id + ":value";
      code.children.push({
        type: libs.Tree.TEXT, text: ' ' + child.attribs.att + '="'
      }, {
        type: libs.Tree.TAG,
        name: 'wdg:label',
        attribs: attribs
      }, {
        type: libs.Tree.TEXT, text: '"'
      });

      delete child.attribs.att;
      panel2.children.push( child );
    } else {
      children.push( child );
    }
  });
  code.children.push({
    type: libs.Tree.TEXT, text: '/>'
  });
  panel2.children.push({ type: libs.Tree.TAG, name: 'hr' });
  //panel2.children.unshift( code );

  ['thm-bg0', 'thm-bg1', 'thm-bg2', 'thm-bg3',
   'thm-bgP', 'thm-bgPL', 'thm-bgPD',
   'thm-bgS', 'thm-bgSL', 'thm-bgSD'].forEach(function (cls) {
     var onClick = "document.getElementById('PANEL').className='panel thm-ele1 " + cls + "'";
     center.children.push({
       type: libs.Tree.TAG,
       name: 'button',
       attribs: {
         'class': 'thm-ele2 ' + cls,
         onclick: onClick
       }
     });
   });
  panel1.children.push(
    {
      type: libs.Tree.TAG,
      name: 'div',
      attribs: { 'class': 'panel thm-bg0 thm-ele1', id: 'PANEL' },
      children: [
        {
          type: libs.Tree.TAG,
          name: 'wdg:' + name.substr( 4 ),
          attribs: widgetAttributes
        },
        center
      ]
    }
  );
  console.log( "widgetAttributes:", JSON.stringify( widgetAttributes, null, '  ' ) );

  root.name = "x-html";
  root.attribs = {
    title: name
  };
  root.children = [
    {
      type: libs.Tree.TAG,
      name: 'header',
      attribs: { 'class': 'thm-bg2 thm-sz-toolbar thm-ele4' },
      children: [
        {
          type: libs.Tree.TAG,
          name: "wdg:button",
          attribs: {
            $text: "Back", $icon: "menu", $flat: "true", $href: "index.html"
          }
        },
        {
          type: libs.Tree.TAG,
          name: "h1",
          attribs: { 'class': 'flex-grow1' },
          children: [
            { type: libs.Tree.TEXT, text: name }
          ]
        }
      ]
    },
    {
      type: libs.Tree.TAG,
      name: 'section',
      attribs: { 'class': 'thm-bg0' },
      children: children
    }
  ];

  libs.compile( root );
  return root;


  var attribs = {};
  var attKey, attVal, attValue, attBind;
  var pre = '<pre>\n&lt;';
  var wdg = "<";
  var wdgID = '';
  if (name.substr(0, 4) == 'wdg.') {
    pre += "wdg:" + name.substr( 4 );
    wdg += "wdg:" + name.substr( 4 );
  } else {
    pre += "x-widget name=\"" + name + "\"";
    wdg += "x-widget name=\"" + name + "\"";
  }
  if (typeof root.attribs.id !== 'undefined') {
    wdgID = " id=\"" + root.attribs.id + "\"";
    delete root.attribs.id;
  }

  for( attKey in root.attribs ) {
    attVal = root.attribs[attKey];
    attVal = attVal.split(' / ');
    attValue = attVal[0].trim();
    wdg += "\n   $" + attKey + "=\"" + attValue + "\"";
    pre += "\n   <span title=\""
      + attKey + " = " + attValue + "\"><b>"
      + attKey + "</b>=\"<span style='color:blue'>";
    if (attVal.length > 1) {
      attBind = attVal[1].trim();
      pre += "<wdg:label bind:value=\"" + attBind + "\" $value=\""
        + attValue + "\"/>";
      wdg += " bind:" + attKey + "=\"" + attBind + "\"";
    } else {
      pre += attValue;
    }
    pre += "</span>\"</span>";
  }
  pre += " />\n</pre>\n";

  wdg = "<div class='light'>\n" + wdg + wdgID + " />\n</div>\n"
    + "<div class='dark'>\n" + wdg + " />\n</div>\n";
  //console.log(pre);
  //console.log(wdg);

  pre = libs.parseHTML( pre );
  libs.compile( pre );
  wdg = libs.parseHTML( wdg );
  libs.compile( wdg );
  root.name = "div";
  root.attribs = {"class": "wdg-code"};
  var content = root.children;
  root.children = [pre, wdg];
  if (content.length > 0) {
    root.children.push( {type: libs.Tree.TAG, name: 'hr'} );
  }
  content.forEach(function (child) {
    libs.compile( child );
    root.children.push( child );
  });
};
