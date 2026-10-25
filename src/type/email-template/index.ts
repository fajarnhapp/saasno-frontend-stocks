export interface EmailTemplate {
    id?: string;
    name?: string;
    description?: string;
    placeholders?: string[];
    customized?: boolean;
    subject?: string;
    heading?: string;
    intro?: string;
    buttonLabel?: string;
    note?: string;
    defaults?: EmailTemplate;
}
