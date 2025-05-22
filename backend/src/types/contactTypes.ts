export interface ContactInput {
  firstname: string;
  lastname: string;
  email: string;
  company?: string;
  jobtitle?: string;
  phone?: string;
  [key: string]: any;
}
