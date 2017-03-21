function gen(n, m) {
	var stack = [];
	var visited = [];

	var maze = new Array(n);

	for(var i=0;i<n;i++)
		maze[i]=new Array(m+1).join('0').split('').map(function () {	return 1; });

	var pos = {x:0, y:0};

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

		//Filter visited/out of index neighbors
		unvisitedNodes = unvisitedNodes.filter(function (neighbor) {
			console.log(neighbor);
			if(neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= m || neighbor.y >= n)
				return false;
			return !visited.filter(function (obj) {
					return obj.x == neighbor.x && obj.y == neighbor.y;
				}).length;
		});

		console.log(unvisitedNodes);

		if(unvisitedNodes.length) {
			//Select a random unvisited neighbor
			var node = unvisitedNodes[Math.floor(Math.random() * unvisitedNodes.length)];
			//Push current cell to stack
			stack.push(pos);

			//Remove the wall between the nodes
			try {
				maze[node.y][node.x] = 0;
				maze[(pos.y + node.y) / 2][(pos.x + node.x) / 2] = 0;
			}
			catch (ex) {
				console.log("exception");
				console.log(node);
				console.log(unvisitedNodes);
				return;
			}
			//Mark the chosen neighbor as visited
			pos = node;
			visited.push(pos);
		} else if (stack.length) {
			pos = stack.pop();
		} else
			break;
	}

	return maze;
}

console.log(gen(25,21))