module.exports = {
  name: "hl",
  type: "messageCreate",
  code: `
    $let[bet;$message[0]]
    $onlyIf[$isNumber[$message[0]]==true;$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[You need to put in an actual number to bet!]
$color[010101]]
    $onlyIf[$message[0]>0;$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[Please put a number higher than 0 to bet!]
$color[010101]]
    $onlyIf[$message[0]<=$getUserVar[cash;$authorID;0];$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[Please don't put more money than you have!]
$color[010101]]
    $let[balance;$getUserVar[cash;$authorID;0]]
    $setUserVar[cash;$sub[$get[balance];$get[bet]];$authorID]
    $let[first;$randomNumber[1;101]]
    $title[High Low]
    $description[The first card is **$get[first]**.

Will the next card be higher or lower?

**Bet:** $get[bet] coins]
    $thumbnail[$userAvatar[$authorID]]
    $color[#5865F2]
    $addActionRow
    $addButton[hl-higher-$get[bet]-$get[first]-$authorID;Higher;Success;⬆️]
    $addButton[hl-lower-$get[bet]-$get[first]-$authorID;Lower;Danger;⬇️]
    $addButton[hl-jackpot-$get[bet]-$get[first]-$authorID;Jackpot;Primary;🎰]
    $reply[]
  `,
};
