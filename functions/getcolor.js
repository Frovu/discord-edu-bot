function rd(m){
	return Math.floor(Math.random() * m);
}
module.exports = function getColor() {
	var color = Array.from('aabbaa')
	let s = [0, 2, 4];
	let lim = 0;
	// shuffle order
	for(let i=0;i<3;++i){
		let j = rd(3);
		[s[i], s[j]] = [s[j], s[i]];
	}
	for(let i=0;i<3;++i){
		let inc = lim>-3 ? rd(10)-4 : rd(6)-1;
		lim += inc;
		let n = parseInt(color[s[i]], 16) + inc;
        if(n>15) n=15;
		n = n.toString(16);
		color[s[i]] = n;
		color[s[i]+1] = n;
		if(inc>3 && lim>1 || i===3 && lim>5) {
            break;
        }
	}
	return color.join('');
}
