# Tech Trends #
Tech Trends is your source for up to date developer employment data! Ever wondered what technologies were trending or if that shiny new programming language is a good time investment for you to learn? Wonder no more
because with our proprietary scraping algorithm we can aggregate data from across multiple job boards to give you an accurate view of the hiring landscape!

Want to contribute? Make a fork of this repo and read on for a more in depth over-view of our application's Architecture.

![TechTrends screenshot](http://i.imgur.com/VLtfakl.png)

## For Contributors ##
Here is a brief over-view and schematic of Tech Trend's architecture. More inline comments can be found in the code base.

## Setting Up and Getting Started ##
To start simply clone your fork of this repo and run `npm install` from the root directory. This will install all of your back-end dependencies and automatically install your front-end
dependencies in the post-install with bower. Running `gulp` from the root directory with automatically compile the `scss` files and minify/uglify the front-end javascript files, `gulp` also watches
your files for changes to make the dev life easier. Once you have your dependencies installed your ready to set up your private files, *it is very important* that these are not made public.
The server expects the URL to wherever your hosting the database to exist in a file called `connections.json` which lives in the connections folder. This file should hold a JSON object with the following format:
````javascript
{
  "production": "yourURL",
  "test":  "yourURL"
}
````
You Also need to create a `keys.js` file in the services directory to control the various options for the scrapper and the cruncher. An example template can be found in the services directory.

Now that you are all setup peruse the `package.json` and check out the various NPM scripts we have provided to quickly start the server!

## Services ##

### Web Scraper ###

The web scraper is run from within the services folder with `node scraper_v1.1.js`. It takes a key file (not included with this repo) that lists hubs, sources, and queries for the scraper to parse.

The scraper iterates over all hubs listed in the key file, removes the HTML and scripts, and stores the listing text in the MongoDB raw database.

### Data Cruncher ###

The cruncher is run from within the services folder with `node cruncher.js`. It takes a key file (not included with this repo) that enumerates the tech collections and the regex to parse the raw text.

The cruncher fetches all records created by the scraper for a given date, parses the text for instances of tech listed in the key file, and counts the number of instances. Once complete, the cruncher saves this data rollup in the prod database.

## Datbases and Server ##
Because there are many moving parts in this application the database design the server, and how everything communicates is quite complex.

### Raw-Postings Database ###
The raw-postings database is where the scrubbed plain text files from the scrapper are stored. It is organized by date, so each record contains all of the plain text scrapped from a specific date (milliseconds since 1970) id. The REST endpoint for the raw DB accepts post request as JSON in this format:

````javascript
[
  {
    date: query.date,
    country: query.country,
    state: query.state,
    hub: query.hub,
    source: query.source,
    term: query.term,
    url: '',
    text: ''
  },
  {},
  {},
  {}
]
````

where each empty object has the same format as the notated object. Because the date records are extremely large we had to have a way for the cruncher to iterate through them. We achieve this through our REST endpoints, a get request to /raw-postings/dates returns an array of date IDs. The /raw-postings endpoint expects two queries: a date and an index. This allows the cruncher to iterate through the postings array, if the index query is -1 the endpoint will return the length of the postings array.

### Analyzed-Data  Database ###
The analyzed Database is organized by hub. Each hub record has a property for each view that is an array of datapoints, where each datapoint has a date and a data property. This allows us to, with one get request, display all of the view data for a hub.  The /analyzed-data end point accepts POST requests as JSON in this format.
````javascript
[
  {
    hubName: "phoenix",
    views: [
      {
        viewName: "javascriptFrameworks",
        item: {
        date: "123456",
        data: {
          angular: 7,
          backbone: 5,
          react: 6,
          ember: 3,
          knockout: 2,
          aurelia: 1,
          meteor: 0,
          polymer: 1,
          vue: 0,
          mercury: 1
        }
      }
    }
  ]
},
  {
    hubName: "new_york`",
    views: [
      { viewName: "javascriptFrameworks",
        item: {
          date: "123456",
          data: {
            angular: 7,
            backbone: 5,
            react: 6,
            ember: 3,
            knockout: 2,
            aurelia: 1,
            meteor: 0,
            polymer: 1,
            vue: 0,
            mercury: 1
          }
        }
      }
    ]
  }
]
````
where the data reflects what is needed for the specific view.  A GET request to /analyzed-data expects a hub as a query, and will return an object with keys for each view where the value is an array of the datapoints.

## Front End ##
