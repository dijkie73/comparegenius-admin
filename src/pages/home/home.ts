import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as xml2js from 'xml2js';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { DarazProduct } from '../../store';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import * as XmlSplit from 'xmlsplit';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    public xmlItems: any;
    public csvItems: any;
    public tsvItems: any;

    public items: FirebaseListObservable<DarazProduct[]> = null;
    public newProd: FirebaseListObservable<DarazProduct>;

    public newProduct: DarazProduct;

    public firebaseProvider: FirebaseProvider = null;

    constructor(public navCtrl: NavController,
                public db: AngularFireDatabase,
                public http: Http) {

        this.firebaseProvider = new FirebaseProvider(db);

        //this.newProduct = new DarazProduct();
        //this.newProduct.productId = 'A2';
        //this.newProduct.brand = 'Samsung';

        //this.firebaseProvider.createDarazProduct(this.newProduct);

        //this.items = db.list('/productfeeds/daraz-product-feed');
    }

    ionViewWillEnter() {
        this.loadXML(this.firebaseProvider);
        this.loadCSV();
        this.loadTSV();
        
    }

    testSplitter() {
        var xmlsplit = new XmlSplit(1, '<autodetect>');

        var splitter = new XmlSplit();

        var count = 0;

        //process.stdin.pipe(splitter).on('data', function (data) {
        //    count++
        //}).on('end', function () {
        //    console.log('Processed %d record(s).', count)
        //})
    }
    loadXML(firebaseProvider: FirebaseProvider) {
        this.http.get('/assets/data/productdata_29.xml')
            .map(res => res.text())
            .subscribe((data) => {
                this.parseXML(data, firebaseProvider)
                    .then((data) => {
                        this.xmlItems = data;
                        console.log(this.xmlItems);
                    });
            });

        
    }



    loadCSV() {
        this.http.get('/assets/data/comics.csv')
            .map(res => res.text())
            .subscribe((data) => {
                var csv = this.parseCSVFile(data);
                this.csvItems = csv;
            });
    }



    loadTSV() {
        this.http.get('/assets/data/comics.tsv')
            .map(res => res.text())
            .subscribe((data) => {
                var tsv = this.parseTSVFile(data);
                this.tsvItems = tsv;
            });
    }




    parseCSVFile(str) {
        var arr = [],
            obj = [],
            row,
            col,
            c,
            quote = false;  // true means we're inside a quoted field

        // iterate over each character, keep track of current row and column (of the returned array)
        for (row = col = c = 0; c < str.length; c++) {
            var cc = str[c],
                nc = str[c + 1];        // current character, next character

            arr[row] = arr[row] || [];             // create a new row if necessary
            arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

            /* If the current character is a quotation mark, and we're inside a
               quoted field, and the next character is also a quotation mark,
               add a quotation mark to the current column and skip the next character */
            if (cc == '"' && quote && nc == '"') {
                arr[row][col] += cc;
                ++c;
                continue;
            }


            // If it's just one quotation mark, begin/end quoted field
            if (cc == '"') {
                quote = !quote;
                continue;
            }


            // If it's a comma and we're not in a quoted field, move on to the next column
            if (cc == ',' && !quote) {
                ++col;
                continue;
            }


            /* If it's a newline and we're not in a quoted field, move on to the next
               row and move to column 0 of that new row */
            if (cc == '\n' && !quote) {
                ++row;
                col = 0;
                continue;
            }


            // Otherwise, append the current character to the current column
            arr[row][col] += cc;
        }

        return this.formatParsedObject(arr, true);
    }



    parseTSVFile(str) {
        var arr = [],
            obj = [],
            row,
            col,
            c;


        // iterate over each character, keep track of current row and column (of the returned array)
        for (row = col = c = 0; c < str.length; c++) {
            var cc = str[c];

            arr[row] = arr[row] || [];             // create a new row if necessary
            arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary


            // If it's a tab move on to the next column
            if (cc == '\t') {
                ++col;
                continue;
            }


            /* If it's a newline move on to the next
               row and move to column 0 of that new row */
            if (cc == '\n') {
                ++row;
                col = 0;
                continue;
            }


            // Otherwise, append the current character to the current column
            arr[row][col] += cc;
        }

        return this.formatParsedObject(arr, false);
    }

    
    parseXML(data, firebaseProvider: FirebaseProvider) {
        return new Promise(resolve => {
            var k,
                arr = [],
                parser = new xml2js.Parser({
                    trim: true,
                    explicitArray: true
                });

            parser.parseString(data, function (err, result) {
                var obj = result.csv_data_records; 
                var i = 0;

                for (k in obj.record) {
                    var item = obj.record[k];

                    var newProduct = new DarazProduct();
                    console.log(i++); 

                    //newProduct.$key = item.Product_id[0];
                    newProduct.productId = item.Product_id[0];
                    newProduct.productName = item.Product_name[0];
                    newProduct.modelNumber = item.ModelNumber[0];
                    newProduct.brand = item.Brand[0];
                    newProduct.brandName = item.Brand_name[0];
                    newProduct.description = item.Description[0];
                    newProduct.merchantCategory = item.Merchant_category[0];

                    newProduct.price = item.Price[0];
                    newProduct.deliveryTime = item.Delivery_time[0];
                    newProduct.productUrl = item.ProductURL[0];
                    newProduct.imageUrl = item.ImageURL[0];

                    firebaseProvider.createDarazProduct(newProduct);

                    if (i < 4) {
                        arr.push({
                            id: item.Product_id[0],
                            title: item.Product_name[0],
                            publisher: item.Brand_name[0],
                            genre: item.Merchant_category[0],
                            brand: item.Brand[0],
                            brandName: item.Brand_name[0],
                            deliveryTime: item.Delivery_time[0],
                            description: item.Description[0],
                            imageUrl: item.ImageURL[0],
                            merchantCategory: item.Merchant_category[0],
                            modelNumber: item.ModelNumber[0],
                            price: item.Price[0],
                            productUrl: item.ProductURL[0],
                            productId: item.Product_id[0],
                            productName: item.Product_name[0]
                        });
                    }
                }

                resolve(arr);
            });
        });
    }

    parseXMLOld(data) {
        return new Promise(resolve => {
            var k,
                arr = [],
                parser = new xml2js.Parser({
                    trim: true,
                    explicitArray: true
                });

            parser.parseString(data, function (err, result) {
                var obj = result.comics;
                for (k in obj.publication) {
                    var item = obj.publication[k];
                    arr.push({
                        id: item.id[0],
                        title: item.title[0],
                        publisher: item.publisher[0],
                        genre: item.genre[0]
                    });
                }

                resolve(arr);
            });
        });
    }



    formatParsedObject(arr, hasTitles) {
        let id,
            title,
            publisher,
            genre,
            obj = [];


        for (var j = 0; j < arr.length; j++) {
            var items = arr[j];

            if (items.indexOf("") === -1) {
                if (hasTitles === true && j === 0) {
                    id = items[0];
                    title = items[1];
                    publisher = items[2];
                    genre = items[3];
                }
                else {
                    obj.push({
                        id: items[0],
                        title: items[1],
                        publisher: items[2],
                        genre: items[3]
                    });
                }
            }
        }

        return obj;
    }
}
