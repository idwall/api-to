# 📢 api-to
> IDwall's API Boilerplate

## The project 

At IDwall our main product is an API that is used by our customers to interact with their protocols.  

This project is the boilerplate we've developed over time and we are always improving it, any suggestions would be appreciated.

## Stack

- TypeScript
- Hapi.js

## Usage

You can fork this project, clone it and rename to your own project name.

## Creating new routes

Every route in the API should be in the `server/routers` folder.

Create a folder for your entity, something like "Company" and for every route, create a new file (like `server/routers/company/get_companies.ts`) for it.

### Importing the decorators

The decorators can specify what type of route it's, like GET, POST, PUT, etc. 

So the route declaration would be something like:  
`@get("/company")`

And then you can create the function that will return the proper information

## Building

There's a `docker-compose` file so you can run:  
`docker-compose build && docker-compose up`

## License

[MIT](LICENSE.md)
