<template>
	<span class="card" dir="auto" role="button" tabindex="0" @click="onClick"><slot></slot></span>
</template>

<script>
import socket from "../js/socket";
import eventbus from "../js/eventbus";

export default {
	name: "Card",
	props: {
		color: String,
		number: String,
	},
	methods: {
		onClick(event) {
			if (this.number == "") {
				// Handle wilds
				let card;
				if (this.color == "Wild DrawFour") {
					card = " WD4";
				} else {
					card = this.color;
				}
				eventbus.emit("contextmenu:unowild", {
					event: event,
					channel: this.$store.state.activeChannel.channel,
					card: card,
				});
			} else {
				// Handle normal cards
				if (this.number == " Skip") {
					this.number = " s";
				}
				if (this.number == " Reverse") {
					this.number = " r";
				}
				socket.emit("input", {
					target: this.$store.state.activeChannel.channel.id,
					text: ".play " + this.color.charAt(0).toLowerCase() + this.number,
				});
			}
		},
	},
};
</script>
