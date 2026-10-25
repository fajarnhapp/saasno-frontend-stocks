export interface Option {
    value: string;
    label: string;
    // Text under the label in dropdowns; when empty, `value` is shown.
    description?: string;
};