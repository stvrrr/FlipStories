module.exports = {
  name: "ship",
  type: "messageCreate",
  code: `
    $let[userOne;$if[$mentionedUserCount>=2;$findUser[$mentioned[0]];$findUser[$authorID]]]
    $let[userTwo;$if[$mentionedUserCount==0;$randomMemberID[$guildID];$if[$mentionedUserCount==1;$findUser[$mentioned[0]];$findUser[$mentioned[1]]]]]
    $onlyIf[$get[userOne]!=$get[userTwo];$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[You need to mention someone else to ship!]
$color[010101]]
    $let[nameOne;$username[$get[userOne]]]
    $let[nameTwo;$username[$get[userTwo]]]
    $let[avatarOne;$userAvatar[$get[userOne]]]
    $let[avatarTwo;$userAvatar[$get[userTwo]]]
    $let[rate;$randomNumber[1;101]]
    $let[image;https://flipstories.vercel.app/api/discord/ship-image?leftName=$encodeURIComponent[$get[nameOne]]&rightName=$encodeURIComponent[$get[nameTwo]]&leftAvatar=$encodeURIComponent[$get[avatarOne]]&rightAvatar=$encodeURIComponent[$get[avatarTwo]]&rate=$get[rate]]
    $title[Ship Calculator]
    $description[**$get[nameOne]** + **$get[nameTwo]** = **$get[rate]%**]
    $attachment[$get[image];ship.png]
    $image[attachment://ship.png]
    $color[$if[$get[rate]>90;#FF4DA6;#5865F2]]
    $if[$get[rate]>90;$addActionRow
$addButton[ship-propose-$get[userOne]-$get[userTwo];Propose Marriage;Success;💍];]
    $reply[]
  `,
};
