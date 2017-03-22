var maze=[];
var n = 61, m = 81;
var exits = 1;

var Filters = {
	visited: function (neighbor) {
		if(neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= m || neighbor.y >= n)
			return false;
		return maze[neighbor.y][neighbor.x];
	},
	notVisited: function (neighbor) {
		if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= m || neighbor.y >= n)
			return false;
		return !maze[neighbor.y][neighbor.x];
	}
};

function getNeighbors(pos,distance) {
	var neighbors= [];
	distance = distance || 2;
	neighbors.push({x:pos.x-distance,y:pos.y});
	neighbors.push({x:pos.x+distance,y:pos.y});
	neighbors.push({x:pos.x,y:pos.y-distance});
	neighbors.push({x:pos.x,y:pos.y+distance});

	return neighbors;
}

function gen(n, m, exits) {
	var stack = [];
	var visited = [];

	maze = new Array(n);

	for(var i=0;i<n;i++)
		maze[i]=new Array(m+1).join('0').split('').map(function () {	return 1; });

	var pos = {x:1, y:1};

	//Mark start point
	maze[pos.y][pos.x] = 0;
	visited.push(pos);

	while(1) {
		//Generate Neighbours
		var unvisitedNodes = getNeighbors(pos);

		//Filter visited and invalid neighbors
		unvisitedNodes = unvisitedNodes.filter(Filters.visited);

		if(unvisitedNodes.length) {
			//Select a random unvisited neighbor
			var node = unvisitedNodes[Math.floor(Math.random() * unvisitedNodes.length)];
			//Push current cell to stack
			stack.push(pos);

			//Remove the wall between the nodes
			maze[node.y][node.x] = 0;
			maze[(pos.y + node.y) / 2][(pos.x + node.x) / 2] = 0;

			//Mark the chosen neighbor as visited
			pos = node;
			visited.push(pos);
		} else if (stack.length) {
			pos = stack.pop();
		} else
			break;
	}

	//Mark entrance
	maze[1][0] = 0;

	//Mark exits
	for(var i = 0; i < exits; i++) {
		//Choose a random side to put the exit on
		var side = Math.floor(Math.random() * 2);
		var a,b;

		if(side) {		//Bottom
			a = n-1;
			do {
				b = Math.floor(Math.random() * (m - 2)) + 1;
			} while(maze[a][b] == 0 || maze[a][b-1] == 0 || maze[a][b+1] == 0 || maze[a-1][b] != 0 )
		} else {		//Right
			b = m-1;
			do {
				a = Math.floor(Math.random() * (n - 2)) + 1;
			} while(maze[a][b] == 0 || maze[a-1][b] == 0 || maze[a+1][b] == 0 || maze[a][b-1] != 0 )
		}

		maze[a][b] = 0;
	}

	return maze;
}

function $id(id) {
	return document.getElementById(id);
}

function newMaze(n, m, exits) {
	gen(n,m,exits);

	var mazeDiv = $id('maze');
	mazeDiv.innerHTML = "";
	mazeDiv.style.height = n*10 + "px";
	mazeDiv.style.width = m*10 + "px";

	for(var i = 0; i < n; i++) {
		var divrow = document.createElement("div");
		divrow.className = "row";
		for(var j = 0; j < m; j++) {
			var div= document.createElement("div");
			div.style.background = maze[i][j] ? "black" : "white";
			divrow.appendChild(div);
		}
		mazeDiv.appendChild(divrow);
	}
}

Array.prototype.sortedPush = function (element,property) {

	var minIndex = 0;
	var maxIndex = this.length - 1;
	var currentIndex;
	var currentElement;
	var obj = element;

	if(this.length !=0) {
		element = property ? element[property] : element;

		while (minIndex <= maxIndex) {
			currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = property ? (this[currentIndex])[property] : this[currentIndex];

			if (currentElement < element) {
				minIndex = currentIndex + 1;
			}
			else if (currentElement > element) {
				maxIndex = currentIndex - 1;
			}
			else {
				break;
			}
		}

		currentElement = property ? (this[currentIndex])[property] : this[currentIndex];

		if (element > currentElement)
			currentIndex++;

		this.splice(currentIndex,0,obj);
		return currentIndex;
	}
	else
		this[0] = obj;

}

var Heuristics = {
	ManhattanDistance: function (a,b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	},
	StraightLineDistance: function (a,b) {
		return Math.sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y))
	}
};

function markVisited(pos, color) {
	var mazeDiv = $id('maze');
	mazeDiv.querySelectorAll(".row")[pos.y].querySelectorAll("div")[pos.x].style.background = color;
	maze[pos.y][pos.x] = 2;
}


function solve(h) {
	var start = {x:0,y:1,cost:0};
	var queue = [];

	var getNextNode =  function(pos) {
		console.log("expanding",pos);
		var cost = 0;

		//Generate Neighbours
		var neighbors = getNeighbors(pos,1);

		//Filter visited and invalid neighbors
		neighbors = neighbors.filter(Filters.notVisited);

		while(neighbors.length==1) {
			cost++;
			pos=neighbors[0];
			markVisited(pos,"blue");
			neighbors = getNeighbors(pos,1);
			neighbors = neighbors.filter(Filters.notVisited);
		}

		if(cost) {													//Expanding node with single branch
			console.log("Expanded", {x: pos.x, y: pos.y, cost: cost});
			return [{x: pos.x, y: pos.y, cost: cost}];
		} else if(neighbors.length && pos.cost != undefined) {		//Expanding node with multiple branches
			var nodes=[];
			console.log("neighbor", neighbors);
			for(var i = 0; i < neighbors.length; i++) {
				markVisited(neighbors[i],"blue");
				var node = getNextNode(neighbors[i])[0];
				node.cost++;
				nodes.push(node);
			}
			return nodes;
		} else {
			if(pos.cost == undefined)								//Expanding exit node
				return [{x: pos.x, y: pos.y, cost: 1}];
			else
				return [];											//End for expanding node
		}

	};

	queue.sortedPush(start,'cost');
	console.log("init queue", queue, start);

	markVisited(start, "green");

	var i=0;

	while(queue.length) {

		var node = queue.shift();
		console.log("node", node);
		if(node.x == m-1 || node.y == n-1) {
			markVisited(node, "green");
			break;
		}



		//Get adjacent unvisited nodes
		var nodes = getNextNode(node);

		for(var i=0;i<nodes.length;i++) {
			markVisited(nodes[i],"#ff0061");
			queue.sortedPush(nodes[i], 'cost');
		}
	}

}

newMaze(n,m,exits);

solve(Heuristics.ManhattanDistance);
