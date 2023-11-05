const fs = require("fs");
const prompts = require('prompts');

const DIR = '.';

const QUESTIONS = [
    {
        type: 'text',
        name: 'title',
        message: 'Block Name'
    },
    {
        type: 'text',
        name: 'description',
        message: 'Block description',
        initial: ''
    },
    
    {
        type: 'text',
        name: 'category',
        message: 'Block category',
        initial: 'theme'
    },
    {
        type: 'text',
        name: 'icon',
        message: 'Dashicon',
        initial: 'awards'
    },
    {
        type: 'text',
        name: 'basefold',
        message: 'Base Blocks Folder',
        initial: 'blocks'
    },
    {
        type: 'text',
        name: 'basescss',
        message: 'Base SCSS File',
        initial: '_blocks.scss'
    },
];

const path = require('path');



exports.acfBlock = function() {

    console.clear();
    console.log('/***** Running Version - 1.3.1 *****/');
    console.log('');
    console.log('Engaging Block Folder Creation - press ESC at any time to cancel');
    console.log('');

    let cancelled = false;

    // Listen for SIGINT signals and set the "cancelled" flag to true.
    process.on('SIGINT', () => {
        console.log('Cancelled.');
        cancelled = true;
    });

    // Helper function for creating files.
    const createFile = async (path, content, successMessage, errorMessage) => {
        try {
            fs.writeFileSync(path, content);
            console.log(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
        }
    };

    (async () => {
				const response = await prompts(QUESTIONS, {onCancel: () => {cancelled = true}});

				// Check if the user cancelled the prompts.
				if (cancelled) {
					console.log('Aborting...');
					return;
				}

        const block_title = response.title;
        const block_description = response.description;
        const block_category = response.category;

        const block_slug = response.title.replace(/\s+/g, '-').toLowerCase();
        const block_folder = '/' + block_slug;
        
        // Block JSON Variables
        const block_style = '[ "file:.\/'+block_slug+'-style.css" , "'+block_slug+'-style" ]';
        const block_render = "blocks/"+block_slug +"/block.php";

        // Folder Creation Variables
        const baseaddress = DIR;
        const basefolder = response.basefold;
        const block_folder_path = baseaddress + '/' + basefolder + block_folder;
        const includescss = block_slug + '/' + block_slug;  
        
        
        // Folder and File Registration Variables
        const masterfile = basefolder+ '/' +response.basescss;   
        const blockregister = basefolder+ '/register-blocks.php'; 

        
        // Create default CSS class.
        const css = '.' +block_slug + ' { \n// CSS goes here \n}';

        console.log('');
        console.log('/***** Folder Creation *****/');
        console.log('');
        
        // Create Master Folder.
        if (!fs.existsSync(basefolder)) {
            fs.mkdirSync(basefolder);
            console.log('Master Blocks Base Folder Created');
        };


        // Create Blocks Folder.
        if (!fs.existsSync(block_folder_path)) {
            fs.mkdirSync(block_folder_path);
            console.log('New Block Folder Created');
        } else {
            console.log('Error: A directory called ' + block_slug + ' was already found. Aborting.')
            return;
        }


        // Handle cancellation.
        if (cancelled) { console.log('Aborting.'); return;}

        console.log('');
        console.log('/***** File Creation *****/');
        console.log('');

        // Create the SCSS file.
        await createFile(
            block_folder_path + '/_' + block_slug + '.scss',
            `${css}`,
            `${block_slug}.scss created`,
            'Error creating Partial SCSS file:'
        );

        // Create the CSS file.
        await createFile(
            block_folder_path + '/' + block_slug + '-style.scss',
            `${css}`,
            `${block_slug}-style.css created`,
            'Error creating SCSS file:'
        );

        // Create block.php
        let phpBlockTemplate = '/block-template-php.txt';
        try {
            let data = fs.readFileSync(__dirname + phpBlockTemplate, 'utf8');
            data = data.replace(/BlockTITLE/g,  block_title)
						.replace(/BlockSLUG/g, block_slug)
						.replace(/\r\n/g, '\n');
				await createFile(
						block_folder_path + '/block.php',
						data,
						`block.php created`,
						'Error creating PHP template:'
				);
		} catch (error) {
				console.error('Error creating PHP template:', error);
		}        

        // Create template.php
        let phpTemplate = '/template-php.txt';
        try {
                    let data = fs.readFileSync(__dirname + phpTemplate, 'utf8');
                    data = data.replace(/BlockTITLE/g,  block_title)
                                .replace(/BlockDescription/g, block_description)
                                .replace(/\r\n/g, '\n');
                        await createFile(
                                block_folder_path + '/template.php',
                                data,
                                `template.php created`,
                                'Error creating PHP template:'
                        );
        } catch (error) {
                console.error('Error creating PHP template:', error);
        };
        
        // Create block.json
        let jsonBlock = '/template-block-json.txt';
        try {
            let data = fs.readFileSync(__dirname + jsonBlock, 'utf8');
            data = data.replace(/BlockTITLE/g,  block_title)
						.replace(/BlockSLUG/g, block_slug)
                        .replace(/BlockDESCRIPTION/g, block_description)
                        .replace(/BlockCATEGORY/g, response.category)
                        .replace(/BlockICON/g, response.icon)
                        .replace(/BlockSTYLE/g, block_style)
                        .replace(/BlockRENDER/g, block_render)
						.replace(/\r\n/g, '\n');
				await createFile(
						block_folder_path + '/block.json',
						data,
						`block.json created`,
						'Error creating JSON template:'
				);
		} catch (error) {
				console.error('Error creating JSON template:', error);
		}

        console.log('');
        console.log('/***** Add to Registration Files *****/');
        console.log('');

        // Create the global registration file
        if (!fs.existsSync(blockregister)) {       
            fs.appendFile(blockregister, '', function (err) {
                if (err) throw err;
                fs.appendFileSync(blockregister, "<?php "); 
            fs.appendFileSync(blockregister, "\n register_block_type( get_template_directory() . 'blocks/"+block_slug+"/block.json' ); "); 
                console.log('Master registration file created'); 
                console.log('Block added to registration file'); 
            });
            
        } else {
            fs.appendFileSync(blockregister, "\n register_block_type( get_template_directory() . '/blocks/"+block_slug+"/block.json' ); "); 
            console.log('Block added to registration file'); 
        };

        // Create the global SCSS file to gather all the sub scss sheets
        if (!fs.existsSync(masterfile)) {
                
                fs.appendFile(masterfile, '', function (err) {
                    if (err) throw err;
                    fs.appendFileSync(masterfile, ""); 
                    console.log('Master SCSS file created'); 
                });
                fs.appendFileSync(masterfile, "/* Master File */ \n "); 
                fs.appendFileSync(masterfile, "\n @import '"+includescss+"';"); 
                    console.log('SCSS file added to master'); 
        } else {

                fs.appendFileSync(masterfile, "\n @import '"+includescss+"';"); 
                console.log('SCSS file added to master'); 

        };

})();
}
