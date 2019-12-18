const glob = require('glob');
const fs = require('fs');
const SERVER_FOLDER = './servers';
const simpleGit = require('simple-git/promise');
const git = simpleGit();

glob(`${SERVER_FOLDER}/**/package.json`, null, (err, files) => {

    if (err) return console.error('Unable to scan directory: ' + err);

    files.forEach(file => {
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) return console.error('Unable to scan directory: ' + err);

            const obj = JSON.parse(data);
            const { dependencies } = obj;
            const fileWrie = file

            for (let key in dependencies) {
                if (dependencies[key].includes('file:')){
                    const folderRoad = dependencies[key].split(':');
                    const localFolder = folderRoad[1].slice(3);
                    glob(`${SERVER_FOLDER}/${localFolder}/package.json`, null, (err, files) => {
                        if (err) return console.error('Unable to scan directory: ' + err);

                        files.forEach(file => {
                            fs.readFile(file, 'utf-8', (err, data) => {
                                if (err) return console.error('Unable to scan directory: ' + err);

                                const objVersion = JSON.parse(data);
                                const { version } = objVersion;
                                dependencies[key] = `^${version}`;
                                const str = JSON.stringify(obj, null, 2);
                                fs.writeFileSync(fileWrie, str,  'ascii');
                            });
                        });
                    });
                }
            }
        });
    });
})
git.status()
    .then((status) => {
        if (status.modified.length){
            git.commit('update version to ');
            const fileArray = status.modified.filter(element =>  element.includes('package.json'));
            const addArray = fileArray.map(element => `./${element}`)
            git.add(addArray);
            git.commit('update version to ');
        } else console.log('no change');
    })
    .catch(err => console.error(err));
