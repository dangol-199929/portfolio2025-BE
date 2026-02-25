export type ContactItem = {
    label: string;
    value: string;
    href: string;
    target?: string;
    download?: string;
};
export declare function getContact(): Promise<ContactItem[]>;
export declare function updateContact(items: ContactItem[]): Promise<ContactItem[]>;
//# sourceMappingURL=contact.repository.d.ts.map