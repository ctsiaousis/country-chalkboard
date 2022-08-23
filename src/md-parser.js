import { data, testVisitedCountries } from './codeData';
// const nReadlines = require('n-readlines');
const Markdown = {};
var tripEntries = importAll(require.context('./markdown/', true, /\.(md)$/));
console.log(tripEntries);

let clearTripEntries = [];
for (let entry in tripEntries) {
    let fname = tripEntries[entry].replace("/country-chalkboard/static/media/","");
    fname = fname.split(".").at(0);
    Markdown[entry] = require(`./markdown/${fname}.md`)
    clearTripEntries.push(`${fname}`)
}

tripEntries = [...clearTripEntries]

function importAll(r) {
    return r.keys().map(r);
}


class MdTuple {
    constructor(title, body) {
        this.title = title;
        this.body = body;
    }
}

export class Parser {
    constructor(md_file) {
        this.md_file = md_file;
        this.is_valid = false;
        this.visitedCountries = testVisitedCountries;
        this.raw_contents = '';
        this.tripInfo = new MdTuple('', '');
        this.countriesInfo = new Map();
        this.images = importAll(require.context('./markdown/pictures', true, /\.(png|jpe?g|svg)$/));
    }

    visitedCountries() {
        return this.visitedCountries;
    }

    static testVisitedCountries() {
        return testVisitedCountries;
    }

    static data() {
        return data;
    }

    getTripEntries(){
        return tripEntries;
    }

    getCurrentEntryIdx(){
        return tripEntries.indexOf(this.md_file);
    }

    setMdFileName(newMdFile){
        this.md_file = newMdFile;
    }

    getBodyOfCountry(country_name) {
        if (!this.countriesInfo.has(country_name))
            return '';

        return this.countriesInfo.get(country_name).body;
    }
    getCurTripMarkdown(){
        return `# ${this.tripInfo.title}\n`+this.tripInfo.body;
    }

    async parse() {
        if (!tripEntries.includes(this.md_file)) {
            this.is_valid = false;
            console.error(`The requested entry ${this.md_file} does not exist`);
            return;
        }
        this.is_valid = false;
        this.visitedCountries = testVisitedCountries;
        this.raw_contents = '';
        this.tripInfo = new MdTuple('', '');
        this.countriesInfo = new Map();

        console.log(Markdown[tripEntries.indexOf(this.md_file)]);
        console.log(this.images);

        let result = await makeRequest("GET", Markdown[tripEntries.indexOf(this.md_file)]);

        if (!result.length) {
            console.error(`The requested entry ${this.md_file} is empty`);
        }
        this.is_valid = true;
        this.raw_contents = result;

        this.lineByLine();
    }

    lineByLine() {
        var lines = this.raw_contents.split('\n');
        let isParsingTitle = false;
        let isSection = false;
        let isPicture = false;
        let curCountry = '';
        for (var i = 0; i < lines.length; i++) {
            let line = lines.at(i);

            isSection = line.startsWith('#') && !line.startsWith('###'); //more than two are body

            isPicture = line.startsWith('![');

            if (line.startsWith('# ')) { //note the space
                isParsingTitle = true;
            } else if (line.startsWith('## ')) { //parsing countries
                isParsingTitle = false;
            }

            // console.log(`Line ${i} sect?${isSection} title?${isParsingTitle} : ${line}`);
            if (isParsingTitle && isSection) {
                this.tripInfo.title = line.split('# ').at(1);
            }
            if (isParsingTitle && !isSection) {

                this.tripInfo.body = this.tripInfo.body.concat(line + '\n');
            }
            if (!isParsingTitle && isSection) {
                curCountry = line.split('## ').at(1);
                this.countriesInfo.set(curCountry, new MdTuple(curCountry, ''));
            }
            if (!isParsingTitle && !isSection) {
                let heapTuple = this.countriesInfo.get(curCountry);

                var tmpLine = line;

                if (isPicture) {
                    let reduced = line.split('(').at(1).split(' ').at(0);
                    reduced = reduced.replace('./pictures/', '');
                    reduced = reduced.split('.').at(0);
                    // console.log(reduced);
                    // console.log(`-0----------------------------------------- reduced: ${reduced}`);
                    for(var img in this.images){
                        // console.log(`-0----------------------------------------- includes: ${this.images[img].includes(reduced)} ${img}`);
                        if(this.images[img].includes(reduced)){
                            // console.log(`-0----------------------------------------- includes: ${this.images[img]}`);
                            const regex = /\.(png|jpe?g|svg)$/i;
                            tmpLine = tmpLine.replace('./pictures/'+reduced,this.images[img].replace(regex,''));
                            // console.log(`-0----------------------------------------- AFTER: ${tmpLine}`);
                        }
                    }
                }
                // console.log(`-0-----------------------------------------:${isPicture} ${tmpLine}`);
                heapTuple.body = heapTuple.body.concat(tmpLine + '\n');
                this.countriesInfo.set(curCountry, heapTuple);
            }
        }
        console.log(this.tripInfo.title);
        console.log(this.tripInfo.body);
        console.log(Array.from(this.countriesInfo.keys()));
        this.visitedCountries = Array.from(this.countriesInfo.keys());
    }
}




function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}