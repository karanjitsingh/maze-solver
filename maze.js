var theme = {
	background: "#f8e9e9",
	border: "#394648",
	mark: "#DA6944",
	exploration: "#cbac88",
	solution: "#69995d"
}

var Maze = function(n, m, options) {
	if (n % 2 == 0)
		n++;
	if (m % 2 == 0)
		m++;

	var maze = [];
	var exit;

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
		}
	};

	function getNeighbours(pos,distance) {
		var neighbours= [];
		distance = distance || 2;
		neighbours.push({x:pos.x-distance,y:pos.y});
		neighbours.push({x:pos.x+distance,y:pos.y});
		neighbours.push({x:pos.x,y:pos.y-distance});
		neighbours.push({x:pos.x,y:pos.y+distance});
		return neighbours;
	}

	function gen() {
		var stack = [];
		var pos = {x:1, y:1};

		maze = new Array(n);
		for(var i=0;i<n;i++)
			maze[i]=new Array(m+1).join('0').split('').map(function () {	return 1; });

		//Mark entrance
		markVisited({y:1, x:0}, theme.background, 0, options.renderGen);

		//Mark start point
		markVisited(pos, theme.background, 0, options.renderGen);

		while(1) {
			//Generate Neighbours
			var unvisitedNodes = getNeighbours(pos);

			//Filter visited and invalid neighbours
			unvisitedNodes = unvisitedNodes.filter(Filters.visited);

			if(unvisitedNodes.length) {
				//Select a random unvisited neighbour
				var node = unvisitedNodes[Math.floor(Math.random() * unvisitedNodes.length)];
				//Push current cell to stack
				stack.push(pos);

				//Remove the wall between the nodes
				markVisited({y:(pos.y + node.y) / 2, x:(pos.x + node.x)/2}, theme.background, 0, options.renderGen);
				markVisited(node, theme.background, 0, options.renderGen);

				//Mark the chosen neighbour as visited
				pos = node;
			} else if (stack.length) {
				pos = stack.pop();
			} else
				break;
		}

		//Mark exit
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
		exit = {y:a, x: b};
		markVisited(exit, theme.background, 0, options.renderGen);

		return maze;
	}

	function initCanvas() {
		var div = document.createElement("div");
		div.id = "maze";
		var canvas = document.createElement("canvas");
		canvas.width = (m * 10);
		canvas.height = (n * 10);
		document.body.appendChild(div);
		div.appendChild(canvas);

		var ctx = canvas.getContext('2d');
		if(options.render)
			ctx.encoder = encoder;

		ctx.fillRectWithEncoder = function(x, y, w, h, encode) {
			this.fillRect(x, y, w, h);
			ctx.save();
			if(ctx.encoder && encode !== false)
				ctx.encoder.addFrame(this);
		};

		return ctx;
	}

	function initEncoder() {
		if(GIFEncoder == undefined)
			return null;

		encoder = new GIFEncoder();
		encoder.setRepeat(0);
		encoder.setDelay(0.001);

		return encoder;
	}

	function newMaze() {
		if(!ctx)
			return;

		if(ctx.encoder && options.renderGen !== false)
			ctx.encoder.start();

		ctx.fillStyle = theme.border;
		ctx.fillRectWithEncoder(0, 0, m*10, n*10, options.renderGen !== false);

		ctx.fillStyle = theme.border;

		gen(n,m,ctx);

		if(ctx.encoder && options.renderGen !== false) {
			ctx.encoder.finish();
			renderGIF();
		}
	}

	function markVisited(pos, color, value, render) {
		maze[pos.y][pos.x] = value;
		console.log(pos.x,pos.y,color,value,render);
		if(ctx) {
			ctx.fillStyle = color;
			ctx.fillRectWithEncoder(pos.x * 10, pos.y * 10, 10, 10, render);
		}
	}

	function generateSolution(h) {

		function getNextNode(pos,color) {
			var cost = 0;
			color = color || "";

			//Generate Neighbours
			var neighbours = getNeighbours(pos,1);

			//Filter visited and invalid neighbours
			neighbours = neighbours.filter(Filters.notVisited);

			while(neighbours.length==1) {
				cost++;
				pos=neighbours[0];
				markVisited(pos,color,2, false);
				neighbours = getNeighbours(pos,1);
				neighbours = neighbours.filter(Filters.notVisited);
			}

			if(cost) {													//Expanding node with single branch
				return [{x: pos.x, y: pos.y, cost: cost}];
			} else if(neighbours.length && pos.cost != undefined) {		//Expanding node with multiple branches
				var nodes=[];
				for(var i = 0; i < neighbours.length; i++) {
					markVisited(neighbours[i],color,2, false);
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

		var start = {x:0,y:1,cost:0, hcost: 0};
		var queue = [];
		queue.sortedPush(start,h?'hcost':'cost');
		start.path = [start];

		markVisited(start, theme.mark, 2, options.renderExploration);

		var i=0;

		while(queue.length) {
			var node = queue.shift();

			if(node.x == m-1 || node.y == n-1) {		// If node is exit node / goal node
				markVisited(node, theme.mark, 2, options.renderExploration);
				start.solution = node.path;
				break;
			}

			//Get adjacent unvisited nodes
			var nodes = getNextNode(node, theme.exploration);
			node.nodes = nodes;

			for(var i=0;i<nodes.length;i++) {
				markVisited(nodes[i],theme.mark,2, options.renderExploration);
				nodes[i].path = node.path.slice();
				nodes[i].path.push(nodes[i]);
				nodes[i].hcost = h?h(nodes[i], exit):0;
				queue.sortedPush(nodes[i], h?'hcost':'cost');
			}
		}

		return start;
	}

	function exploreSolution(heuristic) {
		var start = generateSolution(heuristic);
		// return;
		var solution =  start.solution;

		function indexOf(arr, node) {
			for(var i = 0;i < arr.length; i++)
				if(arr[i].x == node.x && arr[i].y == node.y)
					return i;
			return 0;
		}

		markVisited(solution[0],theme.solution, 3, options.renderSolution);
		for(var i = 0; i < solution.length - 1; i++) {
			var next = solution[i+1];
			traverseToNode(solution[i], indexOf(solution[i].nodes, next));
		}

		function traverseToNode(from, index) {
			//Generate Neighbours
			var neighbours = getNeighbours(from,1);
			var pos;

			//Filter visited and invalid neighbours
			neighbours = neighbours.filter(Filters.levelTwo);

			var path = [from];

			do {
				pos=pos?neighbours[0]:neighbours[index];
				path.push(pos);
				markVisited(pos, theme.solution,3, options.renderSolution);
				neighbours = getNeighbours(pos,1);
				neighbours = neighbours.filter(Filters.levelTwo);
			} while(neighbours.length==1);

		}
	}

	function renderGIF() {
		var binary_gif = ctx.encoder.stream().getData();
		var data = 'data:image/gif;base64,' + encode64(binary_gif);
		// window.open(data_url);
		var img = document.createElement('img');
		img.src = data;
		document.body.appendChild(img);
	}
	
	//Initialize Maze
	var encoder = options.render ? initEncoder(): null;
	var ctx = options.ctx ? initCanvas() : null;
	newMaze();

	this.solve = function(heuristic) {
		if(encoder)
			ctx.encoder.start();
		exploreSolution(heuristic);
		if(encoder) {
			ctx.encoder.finish()
			renderGIF();
		}
	};

	return this;

};

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

			if (currentElement < element)
				minIndex = currentIndex + 1;
			else if (currentElement > element)
				maxIndex = currentIndex - 1;
			else
				break;
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

var m = Maze(30,30, {
	ctx: true,
	render: true,
	renderGen: false,
	renderExploration: true,
	renderSolution: true
});

m.solve(Heuristics.ManhattanDistance);
