const taxiCost = 0.40; 
const carCost = 0.20;
const parkingFee = 3;
const flightCost = 0.10;

const taxiOrCar = (numberOfPassengers, milesToAirport) => {  //Obtain vehicle type; how many vehicles; cheapest vehicle
    const numberOfVehicles = Math.ceil(numberOfPassengers / 4);

    const taxiRoute = numberOfVehicles * milesToAirport * taxiCost * 2;
    const carRoute = numberOfVehicles * (parkingFee + milesToAirport * carCost * 2); 

    if (Math.min(taxiRoute, carRoute) === taxiRoute) {
        return {
            vehicle: "Taxi",
            vehicleReturnCost: taxiRoute
        };
    }

    return {
        vehicle: "Car",
        vehicleReturnCost: carRoute
    };
}

const cheapestRoute = (graph, numberOfPassengers, departure, destination) => { 

    const outbound = findShortestPath(graph, departure, destination);            //Find out the outbound shortest route (distance and path)
    const inbound = findShortestPath(graph, destination, departure);            //Find out the inbound shortest route (distance and path)

    const calculateCost = miles => {                                            //Create a flight cost calculator
        if (!Number.isFinite(miles)) {
            return 0;
        }
        return miles * flightCost * numberOfPassengers;
    };
    const formatRoute = path => {                                             //Format the path into a standard route                

        const segments = [];
        for (let i = 1; i < path.length; i++) {                               //Iterate through the path
            const from = path[i - 1];                                         //Obtain the departure location

            const to = path[i];                                               //Obtain the destination location

            const segmentDistance = graph[from][to];                          //Obtain the miles
            segments.push(`${from}${to}${segmentDistance}`);                  //Merge them together and obtain full routes
        }
        return segments.join("-");
    };

    return {
        outboundRoute: formatRoute(outbound.path) || "No outbound flight",
        outboundRouteCost: calculateCost(outbound.distance),
        inboundRoute: formatRoute(inbound.path) || "No inbound flight",
        inboundRouteCost: calculateCost(inbound.distance),
    };
}

const buildGraph = (graphJson) => {                           // implement a function that creates a graph
    const edges = JSON.parse(graphJson);                      // Convert the data into an object called "edges"
    const graph = {};                                         
    for (const [from, to, ...miles] of edges) {              // Obtain departure, destination and distance from each of the edges
        if (!graph[from]) {
            graph[from] = {};
        }

        graph[from][to] = +miles.join("");
    }
    return graph;
};

const buildTable = results => {                                 //Build a function that will create a table in html to display the results
    const makeTd = data => {
        const td = document.createElement("td");
        td.innerText = data;
        return td;
    }

    const tbody = document.getElementById("result");

    for (const row of results) {                               
        const tr = document.createElement("tr");

        tr.appendChild(makeTd(row.vehicle));
        tr.appendChild(makeTd(row.vehicleReturnCost));
        tr.appendChild(makeTd(row.outboundRoute));
        tr.appendChild(makeTd(row.outboundRouteCost));
        tr.appendChild(makeTd(row.inboundRoute));
        tr.appendChild(makeTd(row.inboundRouteCost));
        tr.appendChild(makeTd(row.totalCost));

        tbody.appendChild(tr);
    }
}

const journeySuggestion = () => {
    const graph = buildGraph(document.getElementById("flights").value) //Build a graph with the standard flights
    console.log(graph)
    const results = [];
    const journeys = document.getElementById("journeys").value.split("\n"); //Create an array of journeys separated by newline
    /*Loop through the "journeys" array and obtain number of passengers, departure location, 
        miles from home to departure location, and destination airport */
    for (const journey of journeys) {

        const [numberOfPassengers, homeToAirport, destination] = journey.split(", "); // "2, B20, D"
        const departure = homeToAirport[0]; // "A20"[0] === "A"
        const milesToAirport = homeToAirport.substring(1); // "A20".substring(1) === "20"
    
        const taxiCar = taxiOrCar(numberOfPassengers, milesToAirport);
        const route = cheapestRoute(graph, numberOfPassengers, departure, destination);
        const totalCost = (route.outboundRouteCost === 0 || route.inboundRouteCost === 0)  //Obtain the total cost of a journey
                            ? 0
                            : taxiCar.vehicleReturnCost + route.outboundRouteCost + route.inboundRouteCost;
    
        results.push({
            ...taxiCar,
            ...route,
            totalCost
        });
    }

    buildTable(results);
}