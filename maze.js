function gen(n, m, exits) {
	var stack = [];
	var visited = [];

	var maze = new Array(n);

	for(var i=0;i<n;i++)
		maze[i]=new Array(m+1).join('0').split('').map(function () {	return 1; });

	var pos = {x:1, y:1};

	//Mark start point
	maze[pos.y][pos.x] = 0;
	visited.push(pos);

	while(1) {
		var unvisitedNodes = [];

		//Generate Neighbours
		unvisitedNodes.push({x:pos.x-2,y:pos.y});
		unvisitedNodes.push({x:pos.x+2,y:pos.y});
		unvisitedNodes.push({x:pos.x,y:pos.y-2});
		unvisitedNodes.push({x:pos.x,y:pos.y+2});

		//Filter visited and invalid neighbors
		unvisitedNodes = unvisitedNodes.filter(function (neighbor) {
			if(neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= m || neighbor.y >= n)
				return false;
			return !visited.filter(function (obj) {
					return obj.x == neighbor.x && obj.y == neighbor.y;
				}).length;
		});

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
	var mazeDiv = $id('maze');
	mazeDiv.innerHTML = "";
	var maze = gen(n,m,exits);

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

newMaze(61,81,5);
