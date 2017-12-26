const ytdl = require('ytdl-core');
const request = require('request');
const getYouTubeID = require('get-youtube-id');
const Discord = require('discord.js');
const prefix = "--";

let music = {};
var guild = {};

const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);;


client.on('ready', () => {
    console.log("I'm online & Ready to go!")
  });


client.on('message', message => {
        let guild = music[message.guild.id];
            if (!guild) guild = music[message.guild.id] = {
                queue: [],
                skippers: [],
                skipReq: 0,
                isPlaying: false
        };
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        let song = args.join(' ')

    if (command === 'play') {
        if (!message.member.voiceChannel) return message.reply('Err...No voice channel?');
        if (guild.isPlaying) {
           getID(song, id => {
              if (!id) return message.reply('Unable to extract video.');
              
               dl.getInfo(id, (err, info) => {
                 if (err) return message.reply('Hmm..there was an error extracting that video.');
                 if (info.formats.some(format => format.live)) return message.reply('Not supporting live stream at this time. Sorry.');
                 message.delete();
                    guild.queue.push({
                       info, requester: message.member
                 });
                 message.reply(`The song: ***${info.title}*** has been added to the queue list.`);
        
              });
           });
        
        } else {
          guild.isPlaying = true;
           getID(song, id => {
           if (!id) return message.reply(' unable to extract video');
              ytdl.getInfo(id, (err, info) => {
              if (err) return message.reply('Hmm..there was an error extracting that video.');
              if (info.formats.some(format => format.live)) return message.reply('Not supporting live stream at this time.');
                 message.delete();
                      guild.queue.push({
                       info, requester: message.member
                 });
                 playMusic(guild, message);
              });
           });
         }
        }

        if (command === 'skip') {
            if (!guild || !guild.isPlaying || !message.guild.voiceConnection) return message.reply('No songs are in the queue. Welp.');
            if (!message.member.voiceChannel || message.member.voiceChannel.id !== message.guild.voiceConnection.channel.id) return message.reply('Eh, you need to be in the bot\'s voiceChannel to skip.');
            if (guild.skippers.includes(message.author.id)) return message.reply(' You\'ve already voted to skip!');
            guild.skippers.push(message.author.id)
          
            if (guild.skippers.length >= Math.floor(message.member.voiceChannel.members.size - 1) / 2) {
                skip_song(message);
                message.reply('Skipped');
             } else {
             message.reply(` Your skip has been added. You need ${Math.ceil((msg.member.voiceChannel.members.size - 1) / 2) - guild_config.skippers.length} more votes to skip.`);
             }
          }
          if (command === 'queue') {
            if (!guild) return message.reply('No songs in queue.');
            message.channel.send(`\`\`\`Queue:\n${guild.queue.map(a => `**${a.info.title}** as requested by **${a.requester.user.username}**`).join('\n\n') || 'No songs currently, welp.'}\`\`\``)
          }



});

function getID(str, callback) {
    if (str.includes('youtube.com')) {
        callback(getYouTubeID(str));
    } else {
        search_video(str, (id) => {
            callback(id);
        });
    }
}

function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, (error, response, body) => {
        if (error) return message.reply('There was an error finding that song');
        try {
            const json = JSON.parse(body);
            callback(json.items[0].id.videoId);
        } catch (e) {
            callback(null);
        }
    });
}

function playMusic(guild, message) {
    const voiceChannel = message.member.voiceChannel;

    voiceChannel.join().then(connection => {
        guild.skippers = [];
        const stream = ytdl.downloadFromInfo(guild.queue[0].info, {
            filter: 'audioonly'
        });
        message.channel.send(`Now playing: **${guild.queue[0].info.title}** as requested by ${guild.queue[0].requester.displayName}`);

        const dispatcher = connection.playStream(stream);
        dispatcher.on('error', console.log);
        dispatcher.on('debug', console.log);
        dispatcher.on('end', () => {
            guild.queue.shift();
            if (guild.queue.length === 0) {
                guild.isPlaying = false;
                setTimeout(() => {
                    voiceChannel.leave();
                    return message.channel.send('Queue is empty. Queue up some more tunes!');
                }, 2500);
            } else {
                setTimeout(() => {
                    playMusic(guild, message);
                }, 500);
            }
        });
    });
}

function skip_song(message) {
    message.guild.voiceConnection.dispatcher.end()
  }

  
 client.on("message", function(message) {
    if (message.author.equals(client.user)) return;
  
    if (!message.content.startsWith(prefix)) return;
  
    var args = message.content.substring(prefix.length).split(" ");
  
    switch (args[0].toLowerCase()) {
      case "ping":
          message.channel.sendMessage(":poop: Pong(y)! :poop:");
          break;
      case "info":
          message.channel.sendMessage("I am the music bot made by The Bot Company (https://discord.gg/wkPEVHH). Say **--cmds** for a list of commands.");
              break;
      case "cmds":
            var embed = new Discord.RichEmbed()
      .setFooter("© The Bot Company | This is Toner's current list of commands.")
      .setColor("0x7DCEA0")
      .setTitle("Toner Command List")
      .setThumbnail("https://cdn.discordapp.com/attachments/390183681534459905/390913975820222465/LOGO_WITH_HEADPHONES.jpg")
      .addBlankField()
      .addField("--cmds", "- This displays the list of commands you are viewing right now!")
      .addField("--pong", "- A fun simple command for you to use!")
      .addField("--credit", "- Here you can see all the credits for this bot. Please use this command!")
      .addField("--info", "- Displays information about the bot, well worth reading!")
      .addField("--play (VIDEO URL)", "- Used to play songs, unfortunately at this time you have to put the URL in, still work in progress.")
      .addField("--skip", "- Used to skip a song, does need serveral players in the voice channel for it to work.")
      .addField("--queue", "- Displays the current queue for the guild.")
      .addField("--stop", "- Used to stop the player.")
      .addBlankField()
      .addField("Other Commands/Information", "Some commands do exist but are not listed. If you can find them well done! Commands will change time to time so be sure to keep doing --cmds!")
      message.channel.sendEmbed(embed);
          break;
      case "credit":
          message.channel.sendMessage("Here is a list of credits on who helped with making me!")
          message.channel.sendMessage(" ")
          message.channel.sendMessage("**An0nym0z** - Thanks for your patience helping me fix errors, fixing all little bits of code, without you this bot would'nt be here!")
          message.channel.sendMessage("**Trxpical/TheReal_CatCrafter** - The scripter of this bot & founder of this company. We wouldn't be here if  we didn't have the idea.")
          message.channel.sendMessage("**AviaBeast** - The assistant founder of The Bot Company, without his idea to make a bot Trxpical wouldn't of suggested to.")
          message.channel.sendMessage("**Everyone Else** - Thank you for supporting us and using our bots! Please make sure to show support and we will keep making bots for all of you!")
          break;
      case "play":
          break;
      case "skip":
          break;
      case "queue":
          break;
      default:
          message.channel.sendMessage("That command is invalied. Please try **--cmds** for a list of commands.");
       } 
  });  
