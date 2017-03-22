var maze=[];
var n = 81, m = 181;
var exits = 1;

var Filters = {
	visited: function (neighbour) {
		if(neighbour.x < 0 || neighbour.y < 0 || neighbour.x >= m || neighbour.y >= n)
			return false;
		return maze[neighbour.y][neighbour.x];
	},
	notVisited: function (neighbour) {
		if (neighbour.x < 0 || neighbour.y < 0 || neighbour.x >= m || neighbour.y >= n)
			return false;
		return !maze[neighbour.y][neighbour.x];
	},
	custom: function (neighbour, comparision) {
		if (neighbour.x < 0 || neighbour.y < 0 || neighbour.x >= m || neighbour.y >= n)
			return false;
		return comparision(maze[neighbour.y][neighbour.x]);
	},
	levelTwo: function (neighbour) {
		if (neighbour.x < 0 || neighbour.y < 0 || neighbour.x >= m || neighbour.y >= n)
			return false;
		return maze[neighbour.y][neighbour.x] == 2;
	},
};

function getneighbours(pos,distance) {
	var neighbours= [];
	distance = distance || 2;
	neighbours.push({x:pos.x-distance,y:pos.y});
	neighbours.push({x:pos.x+distance,y:pos.y});
	neighbours.push({x:pos.x,y:pos.y-distance});
	neighbours.push({x:pos.x,y:pos.y+distance});

	return neighbours;
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
		var unvisitedNodes = getneighbours(pos);

		//Filter visited and invalid neighbours
		unvisitedNodes = unvisitedNodes.filter(Filters.visited);

		if(unvisitedNodes.length) {
			//Select a random unvisited neighbour
			var node = unvisitedNodes[Math.floor(Math.random() * unvisitedNodes.length)];
			//Push current cell to stack
			stack.push(pos);

			//Remove the wall between the nodes
			maze[node.y][node.x] = 0;
			maze[(pos.y + node.y) / 2][(pos.x + node.x) / 2] = 0;

			//Mark the chosen neighbour as visited
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

function markVisited(pos, color, value) {
	var mazeDiv = $id('maze');
	mazeDiv.querySelectorAll(".row")[pos.y].querySelectorAll("div")[pos.x].style.background = color;
	maze[pos.y][pos.x] = value;
}

var getNextNode =  function(pos,color) {
	var cost = 0;
	color = color || "";

	//Generate Neighbours
	var neighbours = getneighbours(pos,1);

	//Filter visited and invalid neighbours
	neighbours = neighbours.filter(Filters.notVisited);

	while(neighbours.length==1) {
		cost++;
		pos=neighbours[0];
		markVisited(pos,color,2);
		neighbours = getneighbours(pos,1);
		neighbours = neighbours.filter(Filters.notVisited);
	}

	if(cost) {													//Expanding node with single branch
		return [{x: pos.x, y: pos.y, cost: cost}];
	} else if(neighbours.length && pos.cost != undefined) {		//Expanding node with multiple branches
		var nodes=[];
		for(var i = 0; i < neighbours.length; i++) {
			markVisited(neighbours[i],color,2);
			var node = getNextNode(neighbours[i],color)[0];
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

function delay(time) {
	var x = 0;
	setTimeout(function () {
		x = 1;
	},time);
	while(!x);
}

function visitNode(from, index) {
	//Generate Neighbours
	var neighbours = getneighbours(from,1);
	var pos;

	//Filter visited and invalid neighbours
	neighbours = neighbours.filter(Filters.levelTwo);

	var path = [from];
	console.log("node start",path);

	do {
		pos=pos?neighbours[0]:neighbours[index];
		path.push(pos);
		markVisited(pos,"green",3);
		console.log("node continue", path);
		neighbours = getneighbours(pos,1);
		neighbours = neighbours.filter(Filters.levelTwo);
	} while(neighbours.length==1);

	return path;
}

function generateSolution() {

	var mazex = maze;

	var start = {x:0,y:1,cost:0};
	var queue = [];

	queue.sortedPush(start,'cost');

	// start.parent = 'start';
	start.index = 0;
	start.path = [start];

	markVisited(start, "green", 2);

	var i=0;

	while(queue.length) {

		var node = queue.shift();

		if(node.x == m-1 || node.y == n-1) {
			markVisited(node, "green", 2);
			console.log(start.path.length);

			var path = [-1];

			for(var i=0;i<node.path.length - 1; i++) {
				markVisited(node.path[i],"#ff0061",3);
				var nodePath = visitNode(node.path[i],node.path[i+1].index);
				console.log("nodepath", nodePath);
				path = path.concat(nodePath);
				path.push(-1);
			}

			console.log(path);

			break;
		}

		//Get adjacent unvisited nodes
		var nodes = getNextNode(node, "blue");
		node.nodes = nodes;

		for(var i=0;i<nodes.length;i++) {
			markVisited(nodes[i],"#ff0061",2);
			// nodes[i].parent = node;
			nodes[i].index = i;
			nodes[i].path = node.path.slice();
			nodes[i].path.push(nodes[i]);
			queue.sortedPush(nodes[i], 'cost');
		}
	}

}

newMaze(n,m,exits);
generateSolution();
