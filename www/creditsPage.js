/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var CreditsPage = function (game, options) {
	Phaser.State.call(this);

	this.game = game;
	this.xml = null;
	this.parser = null;
};

CreditsPage.prototype = Object.create(Phaser.State.prototype);
CreditsPage.prototype.constructor = CreditsPage;

Object.defineProperty(Phaser.Button.prototype, "href", {
	value: "",
	writable: true,
	enumerable: true,
	configurable: true
});

Phaser.Utils.extend(CreditsPage.prototype, {
	init: function (options) {
		var defaults = {
			backgroundColor: 0x282828,

			xml_key: "",

			img_row: "bgSettings",
			img_transparent: "transp",

			font: "DroidSans_100",
			fontBold: "DroidSans_100_Bold",

			width: -1,
			height: -1,
			additionalHeight: 0,
			adFn: function () { },

			link_tint: 0x007bf2,

			// labels
			lbl_title: "Credits",
			lbl_close: "Done",

			// numbers
			fontSize: -1,
			smallFontSize: -1,
			largeFontSize: -1,
			header: {
				width: -1,
				height: -1
			},
			text: {
				x: -1,
				y: -1
			},
			done: {
				x: -1,
				y: -1
			},
			row: {
				x: -1,
				y: -1,
				width: -1,
				height: -1,
				text: {
					x: -1,
					wrap: -1
				}
			}
		};

		this.options = Phaser.Utils.extend({}, defaults, options);

		if (this.options.xml_key === null || this.options.xml_key === undefined || this.options.xml_key === "")
			throw new Error("CreditsPage xml file not set.");

		if (this.options.width <= 0) {
			this.options.width = window.innerWidth * window.devicePixelRatio;
		}
		if (this.options.height <= 0) {
			this.options.height = window.innerHeight * window.devicePixelRatio;
			if (this.options.additionalHeight > 0)
				this.options.height = this.options.height - this.options.additionalHeight;
		}

		var commonHeight = .1 * this.options.height;
		if (this.options.fontSize <= 0) {
			this.options.fontSize = .5 * commonHeight;
		}
		if (this.options.smallFontSize <= 0) {
			this.options.smallFontSize = .4 * commonHeight;
		}
		if (this.options.largeFontSize <= 0) {
			this.options.largeFontSize = .6 * commonHeight;
		}
		if (this.options.header.width <= 0) {
			this.options.header.width = this.options.width;
		}
		if (this.options.header.height <= 0) {
			this.options.header.height = commonHeight;
		}
		if (this.options.text.x <= 0) {
			this.options.text.x = this.options.width / 2;
		}
		if (this.options.text.y <= 0) {
			this.options.text.y = commonHeight / 2
		}
		if (this.options.done.x <= 0) {
			this.options.done.x = this.options.width;
		}
		if (this.options.done.y <= 0) {
			this.options.done.y = commonHeight / 2;
		}
		if (this.options.row.x < 0) {
			this.options.row.x = 0;
		}
		if (this.options.row.y <= 0) {
			this.options.row.y = .15 * this.options.height;
		}
		if (this.options.row.width <= 0) {
			this.options.row.width = this.options.width;
		}
		if (this.options.row.height <= 0) {
			this.options.row.height = commonHeight;
		}
		if (this.options.row.text.x <= 0) {
			this.options.row.text.x = .01 * commonHeight;
		}
		if (this.options.row.text.wrap <= 0) {
			this.options.row.text.wrap = .98 * this.options.width;
		}
	},

	create: function () {
		if (this.options.adFn !== null && this.options.adFn !== undefined && typeof this.options.adFn === "function") {
			this.options.adFn();
		}

		this.game.stage.backgroundColor = this.options.backgroundColor;

		this.xml = this.game.cache.getText(this.options.xml_key);
		this.parser = new DOMParser("xml");
		this.xml = this.parser.parseFromString(this.xml, "application/xml");

		var headerBar = game.add.tileSprite(0, 0, this.options.header.width, this.options.header.height, this.options.img_row);
		var settingsText = this.createLabel(this.options.text.x, this.options.text.y, this.options.lbl_title, this.options.fontSize);
		var _x = this.options.done.x;
		var doneText = this.createLabel(function (o) {
			return _x - o.width - 20
		}, this.options.done.y, this.options.lbl_close, this.options.fontSize, true);
		var doneAction = null;
		if (this.xml.querySelector("done").hasAttribute("action")) doneAction = this.xml.querySelector("done").attributes["action"].value;
		if (doneAction == null) {
			doneAction = this.xml.querySelector("done").querySelector("action");
			if (doneAction !== null) doneAction = doneAction.textContent.trim();
		}
		var doneButton = this.createButton(doneText.x, doneText.y, doneText.width, this.options.header.height, this.options.img_transparent, doneAction, this);

		var creditsGroup = this.game.add.group();
		var groups = this.xml.querySelector("groups").querySelectorAll("group");
		var spacing = 0;
		for (var i = 0; i < groups.length; i++) {
			var _y;
			if (i > 0) {
				// group spacer
				_y = this.options.row.y + (spacing * this.options.smallFontSize);
				var groupSpacer = this.createLabel(this.options.row.text.x, _y, " ", this.options.smallFontSize);
				spacing += Math.max(Math.ceil(groupSpacer.width / this.options.row.text.wrap), 1);
				groupSpacer.maxWidth = this.options.row.text.wrap;
				creditsGroup.add(groupSpacer);
			}

			var group = groups[i];

			// group title
			_y = this.options.row.y + (spacing * this.options.largeFontSize);
			var title = this.createTitle(this.options.row.text.x, _y, group.attributes["title"].value, this.options.largeFontSize);
			spacing += Math.max(Math.ceil(title.width / this.options.row.text.wrap), 1);
			title.maxWidth = this.options.row.text.wrap;
			creditsGroup.add(title);

			var articles = group.querySelector("articles").querySelectorAll("article");
			for (var j = 0; j < articles.length; j++) {
				if (j > 0) {
					// group spacer
					_y = this.options.row.y + (spacing * this.options.smallFontSize);
					var articleSpacer = this.createLabel(this.options.row.text.x, _y, " ", this.options.smallFontSize);
					spacing += Math.max(Math.ceil(articleSpacer.width / this.options.row.text.wrap), 1);
					articleSpacer.maxWidth = this.options.row.text.wrap;
					creditsGroup.add(articleSpacer);
				}

				var article = articles[j];

				// article title
				_y = this.options.row.y + (spacing * this.options.largeFontSize);
				var articleTitle = this.createTitle(this.options.row.text.x, _y, article.querySelector("title").textContent.trim(), this.options.smallFontSize);
				spacing += Math.max(Math.ceil(articleTitle.width / this.options.row.text.wrap), 1);
				articleTitle.maxWidth = this.options.row.text.wrap;
				creditsGroup.add(articleTitle);

				// artist
				// name
				var articleNameNode = article.querySelector("name");
				if (articleNameNode !== null) {
					_y = this.options.row.y + (spacing * this.options.largeFontSize);
					var articleName = this.createLabel(this.options.row.text.x, _y, articleNameNode.textContent.trim(), this.options.smallFontSize);
					spacing += Math.max(Math.ceil(articleName.width / this.options.row.text.wrap), 1);
					articleName.maxWidth = this.options.row.text.wrap;
					creditsGroup.add(articleName);
				}
				// copyright
				var articleCopyrightNode = article.querySelector("copyright");
				if (articleCopyrightNode !== null) {
					_y = this.options.row.y + (spacing * this.options.largeFontSize);
					var articleCopyright = this.createLabel(this.options.row.text.x, _y, articleCopyrightNode.textContent.trim(), this.options.smallFontSize);
					spacing += Math.max(Math.ceil(articleCopyright.width / this.options.row.text.wrap), 1);
					articleCopyright.maxWidth = this.options.row.text.wrap;
					creditsGroup.add(articleCopyright);
				}
				// link
				var articleLinkNode = article.querySelector("link");
				if (articleLinkNode !== null) {
					_y = this.options.row.y + (spacing * this.options.largeFontSize);
					var articleLinkText = articleLinkNode.hasAttribute("title") ? articleLinkNode.attributes["title"].value : articleLinkNode.textContent.trim();
					var articleLink = this.createLink(this.options.row.text.x, _y, articleLinkText, articleLinkNode.textContent, this.options.smallFontSize);
					spacing += Math.max(Math.ceil(articleLink.width / this.options.row.text.wrap), 1);
					articleLink.maxWidth = this.options.row.text.wrap;
					creditsGroup.add(articleLink);
				}
				// links
				var links = article.querySelector("links");
				if (links !== null) {
					if (links.hasAttribute("title")) {
						_y = this.options.row.y + (spacing * this.options.largeFontSize);
						var linksTitle = this.createTitle(this.options.row.text.x, _y, links.attributes["title"].value, this.options.smallFontSize);
						spacing += Math.max(Math.ceil(linksTitle.width / this.options.row.text.wrap), 1);
						linksTitle.maxWidth = this.options.row.text.wrap;
						creditsGroup.add(linksTitle);
					}

					links = article.querySelector("links").querySelectorAll("link");
					for (var n = 0; n < links.length; n++) {
						var link = links[n];

						// link
						_y = this.options.row.y + (spacing * this.options.largeFontSize);
						var linkTitle = link.hasAttribute("title") ? link.attributes["title"].value : link.textContent.trim();
						var linkHref = this.createLink(this.options.row.text.x, _y, linkTitle, link.textContent.trim(), this.options.smallFontSize);
						spacing += Math.max(Math.ceil(linkHref.width / this.options.row.text.wrap), 1);
						linkHref.maxWidth = this.options.row.text.wrap;
						creditsGroup.add(linkHref);
					}
				}
			}
		}

		this.game.world.setBounds(0, 0, this.options.width, (.15 * this.options.height) + (10 + spacing * this.options.largeFontSize));
	},

	shutdown: function () {
		delete this.parser;
		delete this.xml;
		delete this.options;
	},

	createButton: function (x, y, w, h, img, click, context) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vButton = this.game.add.button(vX, vY, img, function (o) {
			if (click !== null && click !== undefined && typeof click === "function") {
				click(o);
			}
			if (click !== null && click !== undefined && typeof click === "string") {
				new Function("o", click)(o);
			}
		}, context);
		var vW = 0, vH = 0;
		if (typeof w !== "function") {
			vW = w;
		}
		if (typeof h !== "function") {
			vH = h;
		}
		if (typeof w === "function") {
			vW = w(vButton);
		}
		if (typeof h === "function") {
			vH = h(vButton);
		}
		vButton.width = vW;
		vButton.height = vH;
		if (typeof x === "function") {
			vText.x = x(vText);
		}
		if (typeof y === "function") {
			vText.y = y(vText);
		}
		vButton.anchor.setTo(0, 0.5);

		return vButton;
	},

	createLabel: function (x, y, text, fontSize, tint) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vText = this.game.add.bitmapText(vX, vY, this.options.font, text, fontSize);
		if (typeof x === "function") {
			vText.x = x(vText);
		}
		if (typeof y === "function") {
			vText.y = y(vText);
		}
		if (tint !== undefined) {
			if (tint) {
				vText.tint = this.options.tint;
			}
		}
		vText.anchor.setTo(0, 0.5);

		return vText;
	},

	createLink: function (x, y, text, href, fontSize) {
		var vText = this.createLabel(x, y, text, fontSize, true);
		var vLink = this.createButton(x, y, vText.width, vText.height, this.options.img_transparent, function (o) {
			window.open(o.href, "_blank");
		}, this);
		vText.maxWidth = vLink.maxWidth = this.options.row.text.wrap;
		vLink.href = href;

		return vLink;
	},

	createTitle: function (x, y, text, fontSize, tint) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vText = this.game.add.bitmapText(vX, vY, this.options.fontBold, text, fontSize);
		if (typeof x === "function") {
			vText.x = x(vText);
		}
		if (typeof y === "function") {
			vText.y = y(vText);
		}
		if (tint !== undefined) {
			if (tint) {
				vText.tint = this.options.tint;
			}
		}
		vText.anchor.setTo(0, 0.5);

		return vText;
	}
});

module.exports = CreditsPage;
