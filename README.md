# cordova-plugin-dz-creditspage

// preload

this.game.load.text("creditsXml", "credits.xml");

// init

this.game.state.add("Credits", CreditsPage);

// click event

this.game.state.start("Credits", true, false, {
  xml_key: "creditsXml"
});
