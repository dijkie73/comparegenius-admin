export class Category {
    $key: string;
    id: number;
    name: string;
    urlName: string;
    active: boolean = true;
    parentKey: string;
    icon: string;
}

export class Product {
    $key: string;
    id: number;
    title: string;
    brand: string;
    shortDescription: string;
    urlName: string;
    categoryKey : string;
    featuredImage: string;
}

export class DarazProduct {
    $key: string;
    productId: string;
    productName: string;
    modelNumber: string;

    brand: string;
    brandName: string;

    description: string;

    merchantCategory: string;
    price: number;
    deliveryTime: string;

    productUrl: string;
    imageUrl: string;
}
