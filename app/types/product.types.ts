export interface Product{
    id: string,
    name: string,
    category: string,
    price: number,
    stock:  number,
    status: string,
    sku: string,
    image?:string,
    description: string,
    createdAt: Date
}