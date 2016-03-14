/****************************************
Component x-template

<x-template id="tpl.person">
  <fieldset>
    <legend>Person</legend>
    <div class="tbl">
      <div>
        <div>Name</div>
        <div>
          <input type="text value="">
            <x-tpl att="value" var="name"/>
            <x-tpl remove-class="invalid" var="name$valid"/>
          </input>
        </div>
      </div>
    </div>
  </fieldset>
</x-template>
****************************************/

exports.tags = ["x-template"];

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var id = root.attribs.id;
    if (typeof id === 'undefined') {
        libs.fatal("[x-template] Missing mandatory attribute `id`!");
    }

    root.children = [];
    root.type = libs.Tree.VOID;    
};
