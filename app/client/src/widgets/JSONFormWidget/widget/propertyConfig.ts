import { Alignment } from "@blueprintjs/core";

import generatePanelPropertyConfig from "./propertyConfig/generatePanelPropertyConfig";
import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { JSONFormWidgetProps } from ".";
import { ROOT_SCHEMA_KEY } from "../constants";
import { ValidationTypes } from "constants/WidgetValidation";
import {
  ButtonVariantTypes,
  ButtonBorderRadiusTypes,
  ButtonPlacementTypes,
} from "components/constants";
import { ButtonWidgetProps } from "widgets/ButtonWidget/widget";
import { OnButtonClickProps } from "components/propertyControls/ButtonControl";
import { ComputedSchemaStatus, computeSchema } from "./helper";
import { EVALUATION_PATH } from "utils/DynamicBindingUtils";

const MAX_NESTING_LEVEL = 5;

const panelConfig = generatePanelPropertyConfig(MAX_NESTING_LEVEL);

export const sourceDataValidationFn = (
  value: any,
  props: JSONFormWidgetProps,
  _?: any,
) => {
  if (value === "") {
    return {
      isValid: false,
      parsed: {},
      messages: ["Source data cannot be empty."],
    };
  }

  if (_.isNil(value)) {
    return {
      isValid: true,
      parsed: {},
    };
  }

  if (_.isPlainObject(value)) {
    return {
      isValid: true,
      parsed: value,
    };
  }

  try {
    return {
      isValid: true,
      parsed: JSON.parse(value as string),
    };
  } catch (e) {
    return {
      isValid: false,
      parsed: {},
      messages: [e.message],
    };
  }
};

const onGenerateFormClick = ({
  batchUpdateProperties,
  props,
}: OnButtonClickProps) => {
  const widgetProperties: JSONFormWidgetProps = props.widgetProperties;

  if (widgetProperties.autoGenerateForm) return;

  const currSourceData = widgetProperties[EVALUATION_PATH]?.evaluatedValues
    ?.sourceData as Record<string, any> | Record<string, any>[];

  const prevSourceData = widgetProperties.schema?.__root_schema__?.sourceData;

  const { dynamicPropertyPathList, schema, status } = computeSchema({
    currentDynamicPropertyPathList: widgetProperties.dynamicPropertyPathList,
    currSourceData,
    prevSchema: widgetProperties.schema,
    prevSourceData,
    widgetName: widgetProperties.widgetName,
  });

  if (status === ComputedSchemaStatus.LIMIT_EXCEEDED) {
    batchUpdateProperties({ fieldLimitExceeded: true });
    return;
  }

  if (status === ComputedSchemaStatus.UNCHANGED) {
    if (widgetProperties.fieldLimitExceeded) {
      batchUpdateProperties({ fieldLimitExceeded: false });
    }
    return;
  }

  if (status === ComputedSchemaStatus.UPDATED) {
    batchUpdateProperties({
      dynamicPropertyPathList,
      schema,
      fieldLimitExceeded: false,
    });
  }
};

const generateFormCTADisabled = (widgetProps: JSONFormWidgetProps) =>
  widgetProps.autoGenerateForm;

const generateButtonStyleControlsFor = (prefix: string) => [
  {
    propertyName: `${prefix}.buttonColor`,
    helpText: "Changes the color of the button",
    label: "Button Color",
    controlType: "COLOR_PICKER",
    isBindProperty: false,
    isTriggerProperty: false,
  },
  {
    propertyName: `${prefix}.buttonVariant`,
    label: "Button Variant",
    controlType: "DROP_DOWN",
    helpText: "Sets the variant of the icon button",
    options: [
      {
        label: "Primary",
        value: ButtonVariantTypes.PRIMARY,
      },
      {
        label: "Secondary",
        value: ButtonVariantTypes.SECONDARY,
      },
      {
        label: "Tertiary",
        value: ButtonVariantTypes.TERTIARY,
      },
    ],
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: [
          ButtonVariantTypes.PRIMARY,
          ButtonVariantTypes.SECONDARY,
          ButtonVariantTypes.TERTIARY,
        ],
        default: ButtonVariantTypes.PRIMARY,
      },
    },
  },
  {
    propertyName: `${prefix}.borderRadius`,
    label: "Border Radius",
    helpText: "Rounds the corners of the icon button's outer border edge",
    controlType: "BORDER_RADIUS_OPTIONS",
    options: [ButtonBorderRadiusTypes.SHARP, ButtonBorderRadiusTypes.ROUNDED],
    isBindProperty: false,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: ["CIRCLE", "SHARP", "ROUNDED"],
      },
    },
  },
  {
    propertyName: `${prefix}.boxShadow`,
    label: "Box Shadow",
    helpText: "Enables you to cast a drop shadow from the frame of the widget",
    controlType: "BOX_SHADOW_OPTIONS",
    isBindProperty: false,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: [
          "NONE",
          "VARIANT1",
          "VARIANT2",
          "VARIANT3",
          "VARIANT4",
          "VARIANT5",
        ],
      },
    },
  },
  {
    propertyName: `${prefix}.boxShadowColor`,
    helpText: "Sets the shadow color of the widget",
    label: "Shadow Color",
    controlType: "COLOR_PICKER",
    isBindProperty: false,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        regex: /^(?![<|{{]).+/,
      },
    },
  },
  {
    propertyName: `${prefix}.iconName`,
    label: "Icon",
    helpText: "Sets the icon to be used for the button",
    controlType: "ICON_SELECT",
    isBindProperty: false,
    isTriggerProperty: false,
    updateHook: (
      props: ButtonWidgetProps,
      propertyPath: string,
      propertyValue: string,
    ) => {
      const propertiesToUpdate = [{ propertyPath, propertyValue }];
      if (!props.iconAlign) {
        propertiesToUpdate.push({
          propertyPath: `${prefix}.iconAlign`,
          propertyValue: Alignment.LEFT,
        });
      }
      return propertiesToUpdate;
    },
    validation: {
      type: ValidationTypes.TEXT,
    },
  },
  {
    propertyName: `${prefix}.placement`,
    label: "Placement",
    controlType: "DROP_DOWN",
    helpText: "Sets the space between items",
    options: [
      {
        label: "Start",
        value: ButtonPlacementTypes.START,
      },
      {
        label: "Between",
        value: ButtonPlacementTypes.BETWEEN,
      },
      {
        label: "Center",
        value: ButtonPlacementTypes.CENTER,
      },
    ],
    defaultValue: ButtonPlacementTypes.CENTER,
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: [
          ButtonPlacementTypes.START,
          ButtonPlacementTypes.BETWEEN,
          ButtonPlacementTypes.CENTER,
        ],
        default: ButtonPlacementTypes.CENTER,
      },
    },
  },
  {
    propertyName: `${prefix}.iconAlign`,
    label: "Icon Alignment",
    helpText: "Sets the icon alignment of the button",
    controlType: "ICON_TABS",
    options: [
      {
        icon: "VERTICAL_LEFT",
        value: "left",
      },
      {
        icon: "VERTICAL_RIGHT",
        value: "right",
      },
    ],
    isBindProperty: false,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: ["center", "left", "right"],
      },
    },
  },
];

export default [
  {
    sectionName: "General",
    children: [
      {
        propertyName: "title",
        label: "Title",
        helpText: "Sets the title of the form",
        controlType: "INPUT_TEXT",
        placeholderText: "Update Order",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "sourceData",
        helpText: "Input JSON sample for default form layout",
        label: "Source Data",
        controlType: "INPUT_TEXT",
        placeholderText: '{ "name": "John", "age": 24 }',
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: sourceDataValidationFn,
            expected: {
              type: "JSON",
              example: `{ "name": "John Doe", "age": 29 }`,
              autocompleteDataType: AutocompleteDataType.OBJECT,
            },
          },
        },
        evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      },
      {
        propertyName: "autoGenerateForm",
        helpText:
          "Caution: When auto generate form is enabled, the form fields would regenerate if there is any change of source data (keys change or value type changes eg from string to number). If disabled then the fields and their configuration won't change with the change of source data.",
        label: "Auto Generate Form",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        customJSControl: "INPUT_TEXT",
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "generateFormButton",
        label: "",
        controlType: "BUTTON",
        isJSConvertible: false,
        isBindProperty: false,
        buttonLabel: "Generate Form",
        onClick: onGenerateFormClick,
        isDisabled: generateFormCTADisabled,
        isTriggerProperty: false,
        dependencies: ["autoGenerateForm", "schema", "fieldLimitExceeded"],
        evaluatedDependencies: ["sourceData"],
      },
      {
        propertyName: `schema.${ROOT_SCHEMA_KEY}.children`,
        helpText: "Field configuration",
        label: "Field Configuration",
        controlType: "FIELD_CONFIGURATION",
        isBindProperty: false,
        isTriggerProperty: false,
        panelConfig,
        dependencies: ["schema"],
      },
      {
        propertyName: "disabledWhenInvalid",
        helpText:
          "Disables the submit button when the parent form has a required widget that is not filled",
        label: "Disabled Invalid Forms",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "animateLoading",
        label: "Animate Loading",
        controlType: "SWITCH",
        helpText: "Controls the loading of the widget",
        defaultValue: true,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "fixedFooter",
        helpText: "Makes the footer always stick to the bottom of the form",
        label: "Fixed Footer",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "isVisible",
        helpText: "Controls the visibility of the widget",
        label: "Visible",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "scrollContents",
        helpText: "Allows scrolling of the form",
        label: "Scroll Contents",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "showReset",
        helpText: "Show/Hide reset form button",
        label: "Show Reset",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "submitButtonLabel",
        helpText: "Changes the label of the submit button",
        label: "Submit Button Label",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "resetButtonLabel",
        helpText: "Changes the label of the reset button",
        label: "Reset Button Label",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "Actions",
    children: [
      {
        propertyName: "onSubmit",
        helpText: "Triggers an action when the submit button is clicked",
        label: "onSubmit",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
  {
    sectionName: "Form Styles",
    isDefaultOpen: false,
    children: [
      {
        propertyName: "backgroundColor",
        helpText: "Use a html color name, HEX, RGB or RGBA value",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "Background Colour",
        controlType: "COLOR_PICKER",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "borderColor",
        helpText: "Use a html color name, HEX, RGB or RGBA value",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "Border Colour",
        controlType: "COLOR_PICKER",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "borderWidth",
        helpText: "Enter value for border width",
        label: "Border Width",
        placeholderText: "Enter value in px",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
      },
      {
        propertyName: "borderRadius",
        helpText: "Enter value for border radius",
        label: "Border Radius",
        placeholderText: "Enter value in px",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
      },
      {
        propertyName: "boxShadow",
        label: "Box Shadow",
        helpText:
          "Enables you to cast a drop shadow from the frame of the widget",
        controlType: "BOX_SHADOW_OPTIONS",
        isBindProperty: false,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: [
              "NONE",
              "VARIANT1",
              "VARIANT2",
              "VARIANT3",
              "VARIANT4",
              "VARIANT5",
            ],
          },
        },
      },
      {
        propertyName: "boxShadowColor",
        helpText: "Sets the shadow color of the widget",
        label: "Shadow Color",
        controlType: "COLOR_PICKER",
        isBindProperty: false,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "Submit Button Styles",
    isDefaultOpen: false,
    children: generateButtonStyleControlsFor("submitButtonStyles"),
  },
  {
    sectionName: "Reset Button Styles",
    isDefaultOpen: true,
    children: generateButtonStyleControlsFor("resetButtonStyles"),
    dependencies: ["showReset"],
    hidden: (props: JSONFormWidgetProps) => !props.showReset,
  },
];