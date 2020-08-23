"use strict";

import socket from "../socket";
import eventbus from "../eventbus";
import store from "../store";

export function generateChannelContextMenu($root, channel, network) {
	const typeMap = {
		lobby: "network",
		channel: "chan",
		query: "query",
		special: "chan",
	};

	const closeMap = {
		lobby: "Remove",
		channel: "Leave",
		query: "Close",
		special: "Close",
	};

	let items = [
		{
			label: channel.name,
			type: "item",
			class: typeMap[channel.type],
			link: `/chan-${channel.id}`,
		},
		{
			type: "divider",
		},
	];

	// Add menu items for lobbies
	if (channel.type === "lobby") {
		items = [
			...items,
			{
				label: "Edit this network…",
				type: "item",
				class: "edit",
				link: `/edit-network/${network.uuid}`,
			},
			{
				label: "Join a channel…",
				type: "item",
				class: "join",
				action: () => (network.isJoinChannelShown = true),
			},
			{
				label: "List all channels",
				type: "item",
				class: "list",
				action: () =>
					socket.emit("input", {
						target: channel.id,
						text: "/list",
					}),
			},
			{
				label: "List ignored users",
				type: "item",
				class: "list",
				action: () =>
					socket.emit("input", {
						target: channel.id,
						text: "/ignorelist",
					}),
			},
			{
				label: "Close all private messages",
				type: "item",
				class: "close-pms",
				action() {
					network.channels.forEach(function (channel) {
						if (channel.type == "query") {
							$root.closeChannel(channel);
						}
					});
				},
			},
			{
				type: "divider",
			},
			{
				label: "IRC - Connect to Network",
				type: "item",
				class: "connect",
				action: () =>
					socket.emit("input", {
						target: channel.id,
						text: "/znc connect",
					}),
			},
			{
				label: "IRC - Disconnect from Network",
				type: "item",
				class: "disconnect",
				action: () =>
					socket.emit("input", {
						target: channel.id,
						text: "/znc disconnect",
					}),
			},
			{
				type: "divider",
			},
			network.status.connected
				? {
						label: "Webchat - Disconnect",
						type: "item",
						class: "disconnect",
						action: () =>
							socket.emit("input", {
								target: channel.id,
								text: "/disconnect",
							}),
				  }
				: {
						label: "Webchat - Connect",
						type: "item",
						class: "connect",
						action: () =>
							socket.emit("input", {
								target: channel.id,
								text: "/connect",
							}),
				  },
		];
	}

	// Add menu items for channels
	if (channel.type === "channel") {
		items.push(
			{
				label: "Edit topic",
				type: "item",
				class: "edit",
				action() {
					channel.editTopic = true;
					$root.switchToChannel(channel);
				},
			},
			{
				label: "List banned users",
				type: "item",
				class: "list",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/banlist",
					});
				},
			},
			{
				type: "divider",
			},
			{
				label: "Give all users voice",
				type: "item",
				class: "action-mode-mass-voice",
				action() {
					var userlist = "";
					channel.users.forEach(function (user) {
						if (user.mode == "") {
							userlist = userlist + user.nick + " ";
						}
					});
					socket.emit("input", {
						target: channel.id,
						text: "/voice " + userlist,
					});
				},
			},
			{
				label: "Take all users voice",
				type: "item",
				class: "action-mode-mass-devoice",
				action() {
					var userlist = "";
					channel.users.forEach(function (user) {
						if (user.mode == "+") {
							userlist = userlist + user.nick + " ";
						}
					});
					socket.emit("input", {
						target: channel.id,
						text: "/devoice " + userlist,
					});
				},
			},
			{
				type: "divider",
			},
			{
				label: "Moderate Chat",
				type: "item",
				class: "action-mode-set-m",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/mode +m",
					});
				},
			},
			{
				label: "Unmoderate Chat",
				type: "item",
				class: "action-mode-unset-m",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/mode -m",
					});
				},
			},
			{
				type: "divider",
			}
		);
	}

	// Add menu items for queries
	if (channel.type === "query") {
		items.push({
			label: "User information",
			type: "item",
			class: "action-whois",
			action() {
				$root.switchToChannel(channel);
				socket.emit("input", {
					target: channel.id,
					text: "/whois " + channel.name,
				});
			},
		});
	}

	if (channel.type === "channel" || channel.type === "query") {
		items.push({
			label: "Clear history",
			type: "item",
			class: "clear-history",
			action() {
				eventbus.emit(
					"confirm-dialog",
					{
						title: "Clear history",
						text: `Are you sure you want to clear history for ${channel.name}? This cannot be undone.`,
						button: "Clear history",
					},
					(result) => {
						if (!result) {
							return;
						}

						socket.emit("history:clear", {
							target: channel.id,
						});
					}
				);
			},
		});
	}

	// Add close menu item
	if (channel.type !== "lobby") {
		items.push({
			label: closeMap[channel.type],
			type: "item",
			class: "close",
			action() {
				$root.closeChannel(channel);
			},
		});
	}

	return items;
}

export function generateUserContextMenu($root, channel, network, user) {
	const currentChannelUser = channel
		? channel.users.find((u) => u.nick === network.nick) || {}
		: {};

	const whois = () => {
		const chan = network.channels.find((c) => c.name === user.nick);

		if (chan) {
			$root.switchToChannel(chan);
		}

		socket.emit("input", {
			target: channel.id,
			text: "/whois " + user.nick,
		});
	};

	const items = [
		{
			label: user.nick,
			type: "item",
			class: "user",
			action: whois,
		},
		{
			type: "divider",
		},
		{
			label: "User information",
			type: "item",
			class: "action-whois",
			action: whois,
		},
		{
			label: "Direct messages",
			type: "item",
			class: "action-query",
			action() {
				const chan = $root.$store.getters.findChannelOnCurrentNetwork(user.nick);

				if (chan) {
					$root.switchToChannel(chan);
				}

				socket.emit("input", {
					target: channel.id,
					text: "/query " + user.nick,
				});
			},
		},
	];
	if (user.nick !== "ChanServ") {
		items.push(
			{
				type: "divider",
			},
			{
				label: "Custom Warn",
				type: "item",
				class: "action-custom-warn",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: "Warn Reason",
							text: `Please give in your reason to warn ${user.nick}.`,
							placeholder: `Reason to warn ${user.nick}...`,
							button: `Warn ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}

							socket.emit("input", {
								target: channel.id,
								text:
									user.nick +
									": " +
									result +
									" - See scoutlink.net/rules for more information.",
							});
						}
					);
				},
			},
			{
				label: "Custom Kick",
				type: "item",
				class: "action-custom-kick",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: "Kick Reason",
							text: `Please give in your reason to kick ${user.nick} from ${channel.name}.`,
							placeholder: `Reason to kick ${user.nick} from ${channel.name}...`,
							button: `Kick ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}

							socket.emit("input", {
								target: channel.id,
								text:
									"/kick " +
									user.nick +
									" " +
									result +
									" - See scoutlink.net/rules for more information.",
							});
						}
					);
				},
			}
		);
	}

	if (store.state.settings.ircop && user.nick !== "ChanServ") {
		items.push(
			{
				label: "Custom Kill",
				type: "item",
				class: "action-custom-kill",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: "Kill Reason",
							text: `Please give in your reason to kill ${user.nick}.`,
							placeholder: `Reason to kill ${user.nick}...`,
							button: `Kill ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}

							socket.emit("input", {
								target: channel.id,
								text:
									"/kill " +
									user.nick +
									" " +
									result +
									" - See scoutlink.net/rules for more information.",
							});
						}
					);
				},
			},
			{
				type: "divider",
			},
			{
				label: "Change nickname",
				type: "item",
				class: "action-sa-nick",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: `Change ${user.nick}'s nickname`,
							text: `What do you want to change ${user.nick} nickname to?`,
							placeholder: `New nickname for ${user.nick}...`,
							button: `sanick ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}

							socket.emit("input", {
								target: channel.id,
								text: `/sanick ${user.nick} ${result}`,
							});
						}
					);
				},
			},
			{
				label: "Move user",
				type: "item",
				class: "action-sa-punt",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: `Move user ${user.nick}`,
							text: `What channel do you want to move ${user.nick} to?`,
							placeholder: `Move ${user.nick} to...`,
							button: `Move ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}
							// Sapart
							socket.emit("input", {
								target: channel.id,
								text: `/sapart ${user.nick} ${channel.name}`,
							});
							// Sajoin
							socket.emit("input", {
								target: channel.id,
								text: `/sajoin ${user.nick} ${result}`,
							});
						}
					);
				},
			},
			{
				type: "divider",
			},
			{
				label: "Defenstrate",
				type: "item",
				class: "action-fun-defenestrate",
				action() {
					eventbus.emit(
						"input-dialog",
						{
							title: `Defenestrate user ${user.nick}`,
							text: `What channel do you want to defenestrates ${user.nick} into?`,
							placeholder: `Defenestrate ${user.nick} into...`,
							button: `Defenestrate ${user.nick}`,
						},
						(result) => {
							if (!result) {
								return;
							}
							// Action msg
							socket.emit("input", {
								target: channel.id,
								text: `/me defenestrates ${user.nick} straight into ${result}`,
							});
							// Sapart
							socket.emit("input", {
								target: channel.id,
								text: `/sapart ${user.nick} ${channel.name}`,
							});
							// Sajoin
							socket.emit("input", {
								target: channel.id,
								text: `/sajoin ${user.nick} ${result}`,
							});
						}
					);
				},
			}
		);
	}

	if (user.nick === "ChanServ" && currentChannelUser.mode !== "@") {
		items.push({
			type: "divider",
		});
		items.push({
			label: "Request Op (+o)",
			type: "item",
			class: "action-request-op",
			action() {
				socket.emit("input", {
					target: channel.id,
					text: `/msg Chanserv op ${channel.name}`,
				});
			},
		});
	}

	if (
		(user.nick !== "ChanServ" && currentChannelUser.mode === "@") ||
		(user.nick !== "ChanServ" && store.state.settings.ircop)
	) {
		items.push({
			type: "divider",
		});

		if (store.state.settings.ircop) {
			if (user.mode === "!") {
				items.push({
					label: "Revoke operAdmin (-Y)",
					type: "item",
					class: "action-mode-Y",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/deoperadmin " + user.nick,
						});
					},
				});
			} else {
				items.push({
					label: "Give operAdmin (+Y)",
					type: "item",
					class: "action-mode-Y",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/operadmin " + user.nick,
						});
					},
				});
			}

			if (user.mode === "~") {
				items.push({
					label: "Revoke owner (-q)",
					type: "item",
					class: "action-mode-q",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/deowner " + user.nick,
						});
					},
				});
			} else {
				items.push({
					label: "Give owner (+q)",
					type: "item",
					class: "action-mode-q",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/owner " + user.nick,
						});
					},
				});
			}

			if (user.mode === "&") {
				items.push({
					label: "Revoke admin (-a)",
					type: "item",
					class: "action-mode-a",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/deadmin " + user.nick,
						});
					},
				});
			} else {
				items.push({
					label: "Give admin (+a)",
					type: "item",
					class: "action-mode-a",
					action() {
						socket.emit("input", {
							target: channel.id,
							text: "/admin " + user.nick,
						});
					},
				});
			}
		}

		if (user.mode === "@") {
			items.push({
				label: "Revoke operator (-o)",
				type: "item",
				class: "action-mode-o",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/deop " + user.nick,
					});
				},
			});
		} else {
			items.push({
				label: "Give operator (+o)",
				type: "item",
				class: "action-mode-o",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/op " + user.nick,
					});
				},
			});
		}

		if (user.mode === "%") {
			items.push({
				label: "Revoke halfop (-h)",
				type: "item",
				class: "action-mode-h",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/dehop " + user.nick,
					});
				},
			});
		} else {
			items.push({
				label: "Give halfop (+h)",
				type: "item",
				class: "action-mode-h",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/hop " + user.nick,
					});
				},
			});
		}

		if (user.mode === "+") {
			items.push({
				label: "Revoke voice (-v)",
				type: "item",
				class: "action-mode-v",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/devoice " + user.nick,
					});
				},
			});
		} else {
			items.push({
				label: "Give voice (+v)",
				type: "item",
				class: "action-mode-v",
				action() {
					socket.emit("input", {
						target: channel.id,
						text: "/voice " + user.nick,
					});
				},
			});
		}
	}

	return items;
}
