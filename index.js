'use strict'

const path = require('path')
const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const glob = require('glob')
const shell = require('shelljs')
const prependFile = require('prepend-file')

const NO_DELETE = true

const options = {
	nodir: true,
	ignore: ['**/node_modules/**']
}

const commentMarkers = {
	js: '//',
	jsx: '//',
	py: '#'
}

const template =
	'Copyright {year} Orbital Insight Inc., all rights reserved.\nContains confidential and trade secret information.\nGovernment Users:  Commercial Computer Software - Use governed by\nterms of Orbital Insight commercial license agreement.'

glob(
	'/Users/huarui/orbital/base/pegasus/pegasus/**/+(*.js|*.jsx|*.py)',
	options,
	(err, files) => {
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
				if (commentLines && !NO_DELETE) {
					commentLines++
					// remove old header
					shell.exec("sed -i '' 1," + commentLines + 'd ' + fname, {
						silent: true
					})
				}
				// prepend new header
				const comment =
					marker +
					' ' +
					template.replace(/\n/g, '\n' + marker + ' ') +
					'\n\n'
				prependFile(fname, comment, function(err) {
					if (err) {
						console.error('Error prepending to file: ' + fname)
					} else {
						console.log('added comment to file: ' + fname)
					}
				})
			})
		})
	}
)
