'use strict'

const path = require('path')
const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const glob = require('glob')

const options = {
	nodir: true,
	ignore: ['./test_dir/**/exclude/**']
}

const commentMarkers = {
	js: '//',
	py: '#'
}

glob('./test_dir/**/+(*.js|*.py)', options, (err, files) => {
	files.forEach(fname => {
		const extension = path.extname(fname).slice(1)
		const marker = commentMarkers[extension]
		const instream = fs.createReadStream(fname)
		const outstream = new stream()
		const rl = readline.createInterface(instream, outstream)
		let commentLines = 0
		rl.on('line', function(line) {
			if (line.startsWith(marker)) {
				commentLines++
			} else {
				rl.close()
			}
		})

		rl.on('close', function() {
			console.log(fname, commentLines)
		})
	})
})
