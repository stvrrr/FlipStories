module.exports = {
  name: "help_command",
  type: "interactionCreate",
  allowedInteractionTypes: ["selectMenu"],
  code: `
    $deferUpdate
    $let[command;$selectMenuValues[0]]
    $title[Command Details]
    $description[Command \`$get[command]\` selected.]
    $addField[Description;$if[$get[command]==balance;Check your balance;$if[$get[command]==coinflip;Flip a coin;$if[$get[command]==deposit;Deposit coins into the bank;$if[$get[command]==give;Give coins to another member;$if[$get[command]==rob;Attempt to rob another member;$if[$get[command]==slot;Spin the slot machine;$if[$get[command]==withdraw;Withdraw coins from the bank;$if[$get[command]==work;Earn coins by working;$if[$get[command]==cmds;View the available commands;$if[$get[command]==ping;Check bot latency;$if[$get[command]==story;Interact with Flip Stories;$if[$get[command]==welcomer;Configure welcome and leave embeds with an interactive menu;$if[$get[command]==welcome-preview;Preview a welcome or leave embed;No details available]]]]]]]]]]]];false]
    $addField[Usage;\`help $get[command]\`;false]
    $color[#5865F2]
    $interactionUpdate[ ]
  `,
};
