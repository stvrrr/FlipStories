module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $if[$startsWith[$customID;hl-]==false;$stop;]
    $deferUpdate
    $textSplit[$customID;-]
    $let[choice;$arrayAt[splits;1]]
    $let[bet;$arrayAt[splits;2]]
    $let[first;$arrayAt[splits;3]]
    $let[owner;$arrayAt[splits;4]]
    $if[$authorID==$get[owner];;$interactionReply[Only the player who started this game can use these buttons.]$stop]
    $let[next;$randomNumber[1;101]]
    $let[balance;$getUserVar[cash;$authorID;0]]
    $let[won;false]
    $let[payout;0]
    $if[$get[next]>$get[first];$let[side;higher];$if[$get[next]<$get[first];$let[side;lower];$let[side;tie]]]
    $if[$get[side]==tie;$if[$get[choice]==jackpot;$let[won;true]$let[payout;$multi[$get[bet];6]];$let[won;false]];$if[$get[choice]==$get[side];$let[won;true]$let[payout;$multi[$get[bet];2]];$let[won;false]]]
    $if[$get[won]==true;$setUserVar[cash;$sum[$get[balance];$get[payout]];$authorID];]
    $let[result;$if[$get[won]==true;Won;Lost]]
    $title[High Low • $get[result]]
    $description[First card: **$get[first]**
Second card: **$get[next]**

$if[$get[won]==true;You won **$get[payout]** coins.;You lost your **$get[bet]** coin bet.]

New balance: **$if[$get[won]==true;$sum[$get[balance];$get[payout]];$get[balance]]** coins]
    $color[$if[$get[won]==true;#57F287;#ED4245]]
    $interactionUpdate[ ]
  `,
};
