export class AuthorInfo {
    public Contact: string;
    public Name: string;

    public toJSON() {
        return {
            contact: this.Contact,
            name: this.Name,
        };
    }
}
