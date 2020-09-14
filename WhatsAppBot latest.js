/////////////////////////   Call functions here   /////////////////////////
// I wrote this so I don't have to use eval(), which is quite unsafe

class FunctionObject {
  
  // normal commands 
  ShowHelpMenu	( NO_ARGUMENTS ){ 	ShowHelpMenu( ); 				}
  ShowShortcuts	( NO_ARGUMENTS ){ 	ShowShortcuts( ); 				}
  SpamMessage	( sMsg_and_iIt ){	SpamMessage( sMsg_and_iIt );			}
  WaveMessage	( sMessage ){		WaveMessage( sMessage );			}
  CharMessage	( sMessage ){		CharMessage( sMessage );			}

  // admin+ commands
  StopSpamming  ( NO_AGRUMENTS ){	StopSpamming( );				} 
  ChangeBotName	( sName ){		ChangeBotName( sName);				} 
  ShowGroupList ( NO_ARGUMENTS ){	ShowGroupList( );				}  

  // owner commands
  ChangePrefix	( sNewPrefix ){ 	ChangePrefix( sNewPrefix ); 			}
  ChangeName	( sName ){		ChangeName( sName );				}  
  Admin		( RA_and_sName ){	Admin( RA_and_sName );				}  
  InstaReply	( sMsg ){		InstaReply( sMsg );				}
  CopyCat	( NO_ARGUMENTS ){	ToggleCopyCat( );				}
}


/////////////////////////   Help function   /////////////////////////

let aMemberList = [];
let aAdminList = [];
let sOwner = "message-out"; //the person who set up the bot is also main admin or "owner"

let sChatName = "";
let sBotName = "";
let sOwnerName = "The one who runs this bot";

// sOldText contains the innerHTML of the loaded messages as a string
let sOldText = "";
// iLoadedCount is the amount of loaded messages
let iLoadedCount = 0;

let sPrefix = "!";

let aMessageQueue = [];

let sInstareplymsg = "";
let bDoRepy = false;

let bCopyCat = false;

const iIt_limit = 1000;

const iChar_limit = 100;

const aFunctions = 
[
  [ "[p]help" , "" , "Show this menu" , [ "[p]h" ] ],
  [ "[p]shortcuts" , "" , "Show the shortcut of every command" , [ "[p]short" ] ],
  [ "[p]spam" , "[message] [amount of times {max = "+iIt_limit+"}]" , "Spam a message an x amount of times" , [ "[p]sp" ] ],
  [ "[p]wave" , "[message {max length = "+iChar_limit+"}]" , "Send a message like a wave" , [ "[p]w" ] ],
  [ "[p]char" , "[message {max length = "+iChar_limit+"}]" , "Send a message for every char" , [ "[p]ch" ] ],
  [ "[p]stop" , "" , "Empties the spam queue" , [ "[p]s" ] ],
  [ "[p]botname" , "[new name]" , "Changes the name of the bot" , [ "[p]bn" ] ],
  [ "[p]grouplist" , "" , "Shows everyone's roles" , [ "[p]glist" , "[p]gl" ] ],
  [ "[p]prefix" , "[new prefix]" , "Change the prefix", [ "[p]pre" , "[p]p" ] ],
  [ "[p]name" , "[new name]" , "Change the owner name" , [ "" ] ],
  [ "[p]admin" , "[add/remove] [name]" , "Add an admin" , [ "" ] ],
  [ "[p]instareply" , "[message]" , "instantly reply to all messages" , [ "[p]ir" ] ],
  [ "[p]copycat" , "" , "copies all messages and sends them" , [ "[p]cc" ] ]
];

const aCallFuncs = 
[
  [ "help" , "h" , "ShowHelpMenu" ],
  [ "shortcuts" , "short" , "ShowShortcuts" ],
  [ "spam" , "sp" , "SpamMessage" ],
  [ "wave" , "w" , "WaveMessage" ],
  [ "char" , "ch" , "CharMessage" ],
  [ "stop" , "s" , "StopSpamming" ],
  [ "botname" , "bn" , "ChangeBotName" ],
  [ "grouplist" , "glist" , "gl" , "ShowGroupList" ],
  [ "prefix" , "pre" , "p" , "ChangePrefix" ],
  [ "name" , "ChangeName" ],
  [ "admin" , "Admin" ],
  [ "instareply" , "ir" , "InstaReply" ],
  [ "copycat" , "cc" , "CopyCat" ]
];



/////////////////////////   Show help menu   /////////////////////////

function ShowHelpMenu( NO_ARGUMENTS ){
  
  let sMessage = "Help menu ( [p] = prefix (default = !) )\n\n";
  
  for( let i of aFunctions )
	sMessage += `${i[0]} ${i[1]}: ${i[2]}\n\n`;
	
  Send( sMessage );
  
}



/////////////////////////   Prefix Stuff   /////////////////////////
 
function ChangePrefix( sNewPrefix ){
  
  if( CheckSender()[0] ){
	
    //if the new prefex is nothing, use the old prefix	
    if( sNewPrefix === '' )
	  sNewPrefix = '!';
  
    //no spaces and uppercase characters allowed cuz it I don't like capital chars and spaces will ruin the bot
    Send( `_The prefix has changed from "${ sPrefix }" to "${ sNewPrefix.split(' ').join('').toLowerCase() }"_` );
    
	CheckSpamForPrefix( sNewPrefix.split(' ').join('').toLowerCase() );
	
    sPrefix = ( sNewPrefix != '' )? sNewPrefix.split(' ').join('').toLowerCase() : sPrefix;
	
  } else {
	
	Send(`_Only *${sOwnerName}* can change the prefix_`);
  }
}



/////////////////////////   Shortcuts menu command   /////////////////////////

function ShowShortcuts( NO_ARGUMENTS ){
  
  let sMessage = "";
  
  for( let i of aFunctions )
	sMessage += `Shortcut(s) for ${i[0]}: ${i[3]}\n\n`;

  Send( sMessage );
  
}



/////////////////////////   Spam function  /////////////////////////

function SpamMessage( sMessage_and_iIterations ){
  
  if( sMessage_and_iIterations === '' )
	sMessage_and_iIterations = 'This is a spam message. 10';
    
  if( sMessage_and_iIterations.split( ' ' ).length === 1 || !(/\d/.test( sMessage_and_iIterations[ sMessage_and_iIterations.length - 1 ] ) ) )
	sMessage_and_iIterations += ' 10';
	
  let sSpaces = sMessage_and_iIterations.split( ' ' );
  
  let iSpaces = sMessage_and_iIterations.indexOf( sSpaces[ sSpaces.length - 1 ] );

  let sMessage = sMessage_and_iIterations.slice( 0 , iSpaces - 1 );
  
  let iIterations = sMessage_and_iIterations.slice( iSpaces );
  
  if( iIterations > iIt_limit )
	iIterations = iIt_limit;
  
  sMessage = RemovePrefixFromSpam( sMessage );

  aMessageQueue.push( [ sMessage, iIterations ] );
 
}



/////////////////////////   Wave message function   /////////////////////////

function WaveMessage( sMessage ){
	
  if( sMessage === '' )
	sMessage = 'Wave message';
  
  if( sMessage.length > iChar_limit )
	sMessage = sMessage.slice( 0, iChar_limit - 1 ); 

  sMessage = RemovePrefixFromSpam( sMessage );
  
  aMessageQueue.push( [ sMessage, sMessage.length, 'waveL', 1 ] );

  aMessageQueue.push( [ sMessage, sMessage.length - 1, 'waveR', sMessage.length - 1 ] );
  
}



/////////////////////////   Char message function   /////////////////////////

function CharMessage( sMessage ){
	
  if( sMessage === '' )
	sMessage = 'Message.';

  sMessage = sMessage.split( ' ' ).join( '' );

  if( sMessage.length > iChar_limit )
	sMessage = sMessage.slice( 0, iChar_limit - 1 );
  
  aMessageQueue.push( [ sMessage, sMessage.length, 'char', 0 ] );
  
}



/////////////////////////   Stop Spamming   /////////////////////////

function StopSpamming( ){
  
  let aStatus = CheckSender();
  
  if( aStatus[0] || aStatus[1] ){
	  
    aMessageQueue = [];
  
    if( aStatus[0] )
	  Send( `_*${sOwnerName}* has cleared the spamlist successfully_` );
  
    else 
      Send( `_*${GetSendName()}* has cleared the spamlist successfully_` );
	
  } else {
	
	Send(`_Only *${sOwnerName}* or an admin can clear the spam queue_`);
  }
}



/////////////////////////   Change the Bot's name   ///////////////////////

function ChangeBotName( sName ){
  
  let aStatus = CheckSender();
  
  if( aStatus[0] || aStatus[1] ){
	
	Send(`_The Bot's name has been changed from *${sBotName}* to *${sName}*_`);
	
	sBotName = sName;
	
  } else {
	
	Send(`_Only *${sOwnerName}* or an admin can change the bot's name_`);
  
  }
}



/////////////////////////   Show all people and their roles   /////////////////////

function ShowGroupList( ){
  
  let sList = "";
  
  let aStatus = CheckSender();
  
  if( aStatus[0] || aStatus[1] ){
	
	sList += `_*Members:*_\n`;
	
	if( aMemberList.length === 0 )
	  sList += `_*There are no members*_\n`;
	
	for( let member of aMemberList )
	  sList += `_${member}_\n`;
    
	
	sList += `\n\n_*Admins:*_\n`;
	
	if( aAdminList.length === 0 )
	  sList += `_*There are no admins*_`;
	
	for( let admin of aAdminList )
	  sList += `_${admin}_\n`;

    Send( sList );

  } else {
	  
	Send(`_Only *${sOwnerName}* or an admin can request the group list_`);

  }
}



/////////////////////////   Change the Owner's name   ///////////////////////

function ChangeName( sName ){
  
  if( sName === "" )
	sName = "The one who runs this bot";
  
  if( CheckSender()[0] ){
	
	Send(`_*${sOwnerName}* changed their owner name to *${sName}*_`);
		
	sOwnerName = sName;
	
  } else {
	  
	Send(`_Only *${sOwnerName}* can change their name_`);
	
  }
}



/////////////////////////   Add or Remove an admin   //////////////////////

function Admin( RemAdd_and_sName ){
  let RemAdd = "", sName = "";
  
  //split RemAdd_and_sName up in RemAdd + sName
  let sSpaces = RemAdd_and_sName.split( ' ' );
  let iSpaces = RemAdd_and_sName.indexOf( sSpaces[ sSpaces.length - 1 ] );
  RemAdd = RemAdd_and_sName.slice( 0 , iSpaces - 1 );
  
  // if they only entered a name, remadd will be the name, and if so
  // sName = remadd and remadd will be "add"
  if( RemAdd != "a" && RemAdd != "add" && RemAdd != "r" && RemAdd != "rem" && RemAdd != "remove" ){
	
    sName = RemAdd;
	RemAdd = "add";
	
  }
  
  if( RemAdd === "" ){
	
	RemAdd = "add";
	
  }
  
  sName = RemAdd_and_sName.slice( iSpaces );
  
  if( sName === "" ){
	
	Send(`_You need to enter a name to add to the admin list_`);
   
    return 0;
	
  }
  Send(`_add or remove: *${RemAdd}*_\n_name: *${sName}*_`);
  //check if the executer of the command is the owner
  if( CheckSender()[0] ){
	  
    //check if it should either remove or add an admin
	if( RemAdd === "a" || RemAdd === "add" ){
		
      //make the string to lower case to prevent some possible mistakes
      sName = sName.toLowerCase();
	  
	  // you can enter #everyone to make everyone admin at once 
	  if( sName === "#everyone" ){
		  
		for( let member of aMemberList ){
		  aAdminList.push( member );
		}
		
		aMemberList = [];
		
		Send(`_*Everyone is now admin*_`);
		return 0;
		
	  }
  
      //check if they are already an admin
      for( let admin of aAdminList ){
	    if( sName === admin.toLowerCase() ){
	      Send(`_*${sName}* is already an admin_`);
		  return 0;
		}
	  }
	  
	  if( aMemberList.length === 0 ){
		Send(`_There are no members in your group_`);
	    return 0;
	  }
	  
      for( let member of aMemberList ){
	    //check if a member matches the given name
	    if( sName === member.toLowerCase() ){
	  
	      aMemberList = aMemberList.filter( function( mem ){ return mem != member } );
		  
		  aAdminList.push( member );
		  		  
		  Send(`_*${member}* is now an admin_`);
		  return 0;
		  //if the member is in neither the admin list nor the member list
        } else if( member === aMemberList[ aMemberList.length - 1 ] ) {
		
		  Send(`_*${sName}* is either not spelled correct or does not exist_`);
		  return 0;
	  
	    }
	  }
    } else if( RemAdd === "r" || RemAdd === "rem" || RemAdd === "remove" ){
	  
	  if( aAdminList.length === 0 ){
		Send(`_There are no admins to remove_`);
	    return 0;
	  }
	  
	  // you can enter #everyone to remove all admins at once 
	  if( sName === "#everyone" ){
		
		for( let admin of aAdminList ){
		  aMemberList.push( admin );
		}
		
		aAdminList = [];
				
		Send(`_*All admins have been removed*_`);
		return 0;
		
	  }
	  
	  for( let admin of aAdminList ){
	  
	    //lower case the name and admin to prevent uppercase mistakes
	    if( sName.toLowerCase() === admin.toLowerCase() ){
		
		  aAdminList = aAdminList.filter( function( name ){ name != admin } );
		  aMemberList.push( admin );
		  
		  Send(`_*${admin}* has been removed as an admin by *${sOwnerName}*_`);
		  return 0;
		  
	
	    //if the name is not in the admin list
	    } else if( admin === aAdminList[ aAdminList.length - 1 ] ){
		
		  Send(`_*${sName}* is not in the admin list, so it is either spelled incorrect or they are not an admin_`);
		  return 0;
		  
	    }
	  }
    }
  } else {
	
    Send(`_Only *${sOwnerName}* can add admins_`);
	
  }
}



/////////////////////////   insta reply function    ////////////////////////

function InstaReply( sMsg ){
	
  if( CheckSender()[0] ){
	  
	if( sMsg === "disable" || sMsg === " " ){
		
	  sInstareplymsg = "";
	  bDoReply = false;
	  Send(`_Disabled insta reply_`);
	  
	} else if( sMsg != "" ) {
	  
	  if( IsCommand( sMsg ) )
		sMsg = sMsg.slice( sPrefix.length );
	  
	  sInstareplymsg = sMsg;
	  bDoReply = true;
	  
	  let smoltrickery = "";
	  for(let i = 0; i < 6; i++){
	    smoltrickery += sMsg[i];
	  }
	  if(smoltrickery != sPrefix + "false"){
	    Send(`_Now replying to messages with *${sMsg}*_`);
	  }
	}
  } else {
  
    Send(`_You can't run this command_`);
  
  }
}



/////////////////////////   copy cat function    ////////////////////////

function ToggleCopyCat( ){
	
  if( CheckSender()[0] ){
	  
    bCopyCat = !bCopyCat;
  
    Send( `CopyCat is now ${(bCopyCat)? "*enabled.*" : "*disabled.*" }` );
	  
  } else {
	  
  }
}

function CopyCat( sMessage ){
	
  let bIsCommand = false;
	
  if( IsCommand( sMessage ) )
    bIsCommand = true

  Send(`${(bIsCommand)? "*Cmd:* " : ""}${sMessage}`);

}



/////////////////////////   Check if a message is a command   /////////////////////

function IsCommand( sMessage ){
  
  let bIsCommand = true;
  
  for( let i = 0; i < sPrefix.length; i++ )
	if( sMessage[i] != sPrefix[i] )
	  bIsCommand = false;
  
  return bIsCommand;

}



/////////////////////////   Process the new message   /////////////////////////

function ProcessMessage( sMessage ){
  
  let bIsCommand = IsCommand( sMessage );
  
  if( bDoReply && !CheckSender()[0] )
	Send( sInstareplymsg );
  
  if( bCopyCat && !CheckSender()[0] )
	CopyCat( sMessage );
  
  if( bIsCommand && sMessage.length > sPrefix.length ){
	
	//string without prefix and arguments (command)
    let sCommand;
    
    //string without prefix and command (arguments)
    let sArgument;
	
	if( sMessage.indexOf(' ') === -1 || sMessage.indexOf(' ') === sMessage.length - 1 ){
	  
	  sCommand = sMessage.slice( sPrefix.length ).toLowerCase();
	  
	  sArgument = '';
	
	} else {
	  
	  sCommand = sMessage.slice( sPrefix.length, sMessage.indexOf( ' ' ) ).toLowerCase();
	  
	  sArgument = sMessage.slice( sMessage.indexOf( ' ' ) + 1 );
	  
	}
    
    //search in the functions list for the entered command and 
    //return the function version of it (i.e. s -> Search & pre -> ChangePrefix)
    for( let aI of aCallFuncs )
      for( let sJ of aI )
        if( sCommand === sJ )
          sCommand = aI[ aI.length - 1 ];
          
    //call the command's function
    let callFunction = new FunctionObject();
	
	callFunction[ sCommand ]( sArgument );
	
  }
  
}



/////////////////////////   Send a message   /////////////////////////

function Send( input ) {
	
  var evt = new Event( 'input', { bubbles:true, composer:true } );
  
  document.querySelector( "#main > footer > div > div > div > div.copyable-text" ).innerHTML = input;
  document.querySelector( "#main > footer > div > div > div > div.copyable-text" ).dispatchEvent( evt );
  document.querySelector( "#main > footer > div > div > button > span" ).click( );
  
} 



/////////////////////////   Get the latest message   /////////////////////////

// GetLatestMessage gets the last message that you've send or recieved and returns it as a string
function GetLatestMessage( ){
	
  return document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(1) > div > div > div > div > div > span > span` ).innerHTML;
  
}



/////////////////////////   Get the at time af the latest message   /////////////////////////

// GetLatestMessageTime gets the time of the latest message that has been send or recieved
function GetLatestMessageTime( ){
  
  return document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(1) > div > div > div > div > div > span[dir='auto']` ).innerHTML;
  
}	




/////////////////////////   Checks who send the messages and if they are "bot admin"    ///////////////////////

function CheckSender( ){
  
  let bIsOwner = false;
  let bIsAdmin = false;
  let sName = "";
  
  //check if the message has a class called "message-out" 
  for( let i of document.querySelector(`#main > div > div > div > div > div:nth-last-of-type(1) > div`).parentNode.classList ){
	if( i === sOwner ){
	  bIsOwner = true;
	  bIsAdmin = true;
	  sName = sOwnerName;
	}
  }
  
  if( !bIsOwner ){
    for( let j = 1; j < iLoadedCount; j++ ){
	  if( document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(${j}) > div > div > div > div > span[dir='auto']` ) !== null ){
	    sName = document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(${j}) > div > div > div > div > span[dir='auto']` ).innerHTML;
	    break;
  	  }
    }
  }  
  
  if( !bIsOwner )
    for( let k of aAdminList )
	  if( sName === k )
        bIsAdmin = true;
  
  return [bIsOwner,bIsAdmin,sName];

}



/////////////////////////   Get the sender's name   ////////////////////////

function GetSendName( ){
  
  let sName = "";
  
  for( let i = 1; i < iLoadedCount; i++ ){
	if( document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(${i}) > div > div > div > div > span[dir='auto']` ) !== null ){
	  sName = document.querySelector( `#main > div > div > div > div > div:nth-last-of-type(${i}) > div > div > div > div > span[dir='auto']` ).innerHTML;
	  break;
  	}
  }
  
  return sName;
  
}



/////////////////////////   Check if there is a command in the spam messages   /////////////////////////////

function CheckSpamForPrefix( sNewPrefix ){
  
  let aNewSpamQueue = [];
  
  for( let aSpam of aMessageQueue ){
	let sMessage = aSpam[0];
	let iIterat = aSpam[1];
	let sSpecies = aSpam[2];
	//if the message starts with the prefix and doesn't have a space after the prefix, remove the prefix
    if( sMessage.slice( 0, sNewPrefix.length ) === sNewPrefix && sMessage[ sNewPrefix.length ] != " " ){
		
      sMessage = sMessage.slice( sNewPrefix.length );
      
	  //if it is a wave message, just restart that loop because I'm lazy
	  iIterat = ( sPecies === 'waveL' )? sMessage.length : ( sPecies === 'waveR' )? sMessage.length - 1 : iIterat; 
	  
	}
  }
  
  aMessageQueue = aNewSpamQueue;
  
}



/////////////////////////   Remove prefix in spam messages   //////////////////////////

function RemovePrefixFromSpam( sMessage ){
	
  let bIsCommand = false;
  
  //check if the prefix is matching
  for( let i = 0; i < sPrefix.length; i ++ ){
	  
	if( sMessage[i] != sPrefix[i] ){
		
	  bIsCommand = false;
      break;
	  
    } else if( i === sPrefix.length - 1 ){
		
	  bIsCommand = true;
	  
	}
  }
  
  if( bIsCommand )
	sMessage = sMessage.slice( sPrefix.length );

  return sMessage;  
  
}



/////////////////////////   Get all the group members    /////////////////////////

function GetMembers(){
  
  //this gets a string of all the members separated by ", "
  let sMemberString = document.querySelector('#main > header > div > div > span').innerHTML;

  //turn the string into an array
  aMemberList = sMemberString.split(', ');
  
  //remove the "You" member from the array
  aMemberList.pop();
  
  //remove everyone who is in the admin list
  for( let admin of aAdminList )
	aMemberList.filter( function( member ){ return member != admin } );
  
}



/////////////////////////   Check if a new message is send   /////////////////////////

// CheckForNewMessage checks if the old loaded messages are the same as the new ones
// and if not, it will process the new message

// warning! this bot can only handle about 20 messages per second, so it can get easily overloaded
// in busy group chats. If new chats are coming too fast, the bot might skip messages.
// you can also set the interval to 0 to check as fast as your pc/internet can handle,
// but that might get a bit laggy.
setInterval(

  function( ){ 
	
    //get the new text
    let sNewText = document.querySelector( "#main > div > div > div" ).innerHTML;
  
    //if they aren't the same, process the new message
    if( sOldText != sNewText ){
	  
	  sOldText = sNewText;
	  ProcessMessage( GetLatestMessage( ).split( '&amp;' ).join( '&' ) );
	  
	  //updated the amount of loaded messages
	  iLoadedCount = document.querySelector(`#main > div > div > div > div[tabindex='-1']`).childElementCount; 
	  
    }
  }, 50 
);
  
  
setInterval(
  
  function( ){
	  
	//check the message queue and send the first 5 messages or do nothing
	if( aMessageQueue.toString != '' ){
		
	  let bQueue = ( aMessageQueue.toString() === '' )? false : true;
		
	  //I made a queue for the messages, so the bot doesn't have to send like 1000 messages in one for-loop,
	  //which takes a damn long time to send. Now it just has a countdown to 0 and it sends one message every .25 seconds
		
	  for( let aI = 0; aI < 1; aI++ ){
		
		if( bQueue ){
		
	      if( aMessageQueue[0][1] > 0 ){
	  	  
		    
		  
		  //ways of sending for every case
		  
		    if( aMessageQueue[0][2] === undefined )
	  	      Send( aMessageQueue[0][0] );
		  
		    else if( aMessageQueue[0][2] === 'char' )
			  Send( aMessageQueue[0][0][ aMessageQueue[0][3]++ ] );
			
			else if( aMessageQueue[0][2] === 'waveL' )
			  Send( aMessageQueue[0][0].slice( 0, aMessageQueue[0][3]++ ) );
			  
			else if( aMessageQueue[0][2] === 'waveR' )
		      Send( aMessageQueue[0][0].slice( 0, aMessageQueue[0][3]-- ) );			
	  	   
	  	    aMessageQueue[0][1]--;
		    
			//remove the sub array when it is done sending
		  
		    if( aMessageQueue[0][1] === 0 ){
		  
		      aMessageQueue.shift();
		  
		      if( aMessageQueue.toString() === '' )
			    bQueue = false;
		  
		    }   
		  
		  }
		
		}
		
	  }
	  
	}
  
  }, 250

);



/////////////////////////   Main function   /////////////////////////

function Main( bSendSetupMessage ){
	
  bDoReply = false;
  
  sOldText = document.querySelector( "#main > div > div > div" ).innerHTML;
	
  sBotName = 'Botje';
  
  sChatName = document.querySelector( "#main > header > div[role='button'] > div > div > span[dir='auto']" ).innerHTML;
  
  GetMembers( );
  
  if( bSendSetupMessage )
    Send( `_The bot *"${sBotName}"* is set up and bound to the chat: *"${sChatName}"*._\n_Use !help to see the commands you can use._\n_Download me at https://github.com/Roel-04/WhatsAppBot/blob/master/WhatsAppBot%20latest.js by Roel_` );
  
  else
	console.log(`The bot "${sBotName}" is set up and bound to the chat: "${sChatName}".\nUse !help to see the commands you can use.\nDownload me at https://github.com/Roel-04/WhatsAppBot/blob/master/WhatsAppBot%20latest.js by Roel`);
  
}

Main( false );
