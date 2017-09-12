import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { DarazProduct } from '../../store';

@Injectable()
export class FirebaseProvider {

    private basePath: string = '/product-feeds/daraz-product-feed';

    products: FirebaseListObservable<DarazProduct[]> = null; //  list of objects
    product: FirebaseObjectObservable<DarazProduct> = null; //   single object

    constructor(public db: AngularFireDatabase) {
        this.products = db.list(this.basePath);
        console.log(this.products);
    }

    getDarazProductsList(query = {}): FirebaseListObservable<DarazProduct[]> {
        this.products = this.db.list(this.basePath, {
            query: query
        });

        return this.products
    }

    // Return a single observable item
    getDarazProduct(key: string): FirebaseObjectObservable<DarazProduct> {
        const productPath = '${this.basePath}/${key}';
        this.product = this.db.object(productPath)

        return this.product
    }

    // CRUD operations
    createDarazProduct(product: DarazProduct): void {
        this.products.push(product)
            .catch(error => this.handleError(error))
    }

    // Update an existing product
    updateDarazProduct(key: string, value: any): void {
        this.products.update(key, value)
            .catch(error => this.handleError(error))
    }
    // Deletes a single product
    deleteDarazProduct(key: string): void {
        this.products.remove(key)
            .catch(error => this.handleError(error))
    }
    // Deletes the entire list of products
    deleteAll(): void {
        this.products.remove()
            .catch(error => this.handleError(error))
    }
    // Default error handling for all actions
    private handleError(error) {
        console.log(error)
    }

}

