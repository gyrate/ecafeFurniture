/**
 * ==========================================================================================
 * 表单组件
 * ==========================================================================================
 */
Sui.namespace("Sui.form");

Sui.form.FormLayout = Sui.extend(Sui.Layout, {

    tableElement : null,

    labelClass : "",

    layoutContainer : function(container) {
        var ct = container.getChildRenderTotElement();
        this.tableElement = $("<table></table>").appendTo(ct);

        Sui.form.FormLayout.superclass.layoutContainer.apply(this, arguments);
    },

    addTrElement : function(index) {
        if (index == 0 || index == this.getComponentCount() - 1) {
            return $("<tr></tr>").appendTo(this.tableElement);
        } else {
            return $("<tr></tr>").insertBefore(this.tableElement.children("tr").eq(index));
        }
    },

    renderChildComponent : function(component, config) {

        var childParent = this.tableElement;

        var tr = this.addTrElement(config);

        var labelTd = $("<td></td>").appendTo(tr);
        var fieldTd = $("<td></td>").appendTo(tr);

        $("<label></label>").addClass(this.labelClass).html(component.getLabel()).appendTo(labelTd);

        component.renderTo(fieldTd);


    },



    removeComponent : function(component) {

        var index = component;
        if (! Sui.isNumber(component)) {
            var index = this.indexOfComponent(component);
        }

        Sui.form.FormLayout.superclass.removeComponent.apply(this, arguments);

        // 注意tr元素不是table的直接孩子节点。
        this.tableElement.children("tbody").children("tr").eq(index).remove();

    }

});

Sui.form.Form = Sui.extend(Sui.Container, {

    applyToTagName : "form",

    _createDefaultLayout : function(){
        return new Sui.form.FormLayout();
    },

    initConfig : function(config) {

        Sui.form.Form.superclass.initConfig.apply(this, arguments);

        config = config || {};

        if (config.itemConfigs) {
            this.items = new Sui.util.ArrayList();

            var thisForm = this;
            Sui.each(config.itemConfigs, function(itemConfig, i) {
                thisForm.addComponent(Sui.Components.createComponentFromConfig(itemConfig));
            });
        }
    }

});