<template>
	<div id="connect" class="window" role="tabpanel" aria-label="Connect">
		<div class="header">
			<SidebarToggle />
		</div>
		<form class="container" method="post" action="" @submit.prevent="onSubmit">
			<h1 class="title">
				<template v-if="defaults.uuid">
					<input v-model="defaults.uuid" type="hidden" name="uuid" />
					Edit {{ defaults.name }}
				</template>
				<template v-else>
					Connect
					<template v-if="config.lockNetwork && $store.state.serverConfiguration.public">
						to {{ defaults.name }}client/css/style.css
					</template>
				</template>
			</h1>
			<template v-if="!config.lockNetwork">
				<h2>Network settings</h2>
				<div class="connect-row">
					<label for="connect:name">Network Name</label>
					<input
						id="connect:name"
						v-model="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:host">Server</label>
					<div class="input-wrap">
						<input
							id="connect:host"
							v-model="defaults.host"
							class="input"
							name="host"
							aria-label="Server address"
							maxlength="255"
							required
						/>
						<span id="connect:portseparator">:</span>
						<input
							id="connect:port"
							v-model="defaults.port"
							class="input"
							type="number"
							min="1"
							max="65535"
							name="port"
							aria-label="Server port"
						/>
					</div>
				</div>
				<div class="connect-row">
					<label for="connect:password">Password</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Server password (optional)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
				<div class="connect-row">
					<label></label>
					<div class="input-wrap">
						<label class="tls">
							<input
								v-model="defaults.tls"
								type="checkbox"
								name="tls"
								:disabled="defaults.hasSTSPolicy"
							/>
							Use secure connection (TLS)
							<span
								v-if="defaults.hasSTSPolicy"
								class="tooltipped tooltipped-n tooltipped-no-delay"
								aria-label="This network has a strict transport security policy, you will be unable to disable TLS"
								>🔒 STS</span
							>
						</label>
						<label class="tls">
							<input
								v-model="defaults.rejectUnauthorized"
								type="checkbox"
								name="rejectUnauthorized"
							/>
							Only allow trusted certificates
						</label>
					</div>
				</div>
			</template>
			<template v-else-if="config.lockNetwork && !$store.state.serverConfiguration.public">
				<h2>Network settings</h2>
				<div class="connect-row">
					<label for="connect:name">Name</label>
					<input
						id="connect:name"
						v-model="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:password">Password</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Server password (optional)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
			</template>

			<h2>User preferences</h2>
			<div class="connect-row">
				<label for="connect:nick">Nick</label>
				<input
					id="connect:nick"
					v-model="defaults.nick"
					class="input nick"
					name="nick"
					pattern="[^\s:!@]+"
					maxlength="100"
					required
					@input="onNickChanged"
				/>
			</div>
			<template v-if="config.lockNetwork">
				<h2>Network settings</h2>
				<div class="connect-row">
					<label for="connect:name">Network Name</label>
					<input
						id="connect:name"
						v-model="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:password">Credentials</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="username/network:password"
							name="password"
							maxlength="300"
						/>
						<small>
							This field should contain "username/network:password"<br />
							Username = Your ircmanager.twoopy.nl username.<br />
							Network = The network that you want to connect to.<br />
							Password = Your ircmanager.twoopy.nl password.<br />
							<br />
							The Network name is often, "Scoutlink" or "Twoopy".<br />
							<br />
							When using other clients, put the data above in the "Server password"
							field of your other client.
						</small>
					</RevealPassword>
				</div>
			</template>
			<template v-if="!config.lockNetwork">
				<h2>User preferences</h2>
				<div class="connect-row">
					<label for="connect:nick">Nick</label>
					<input
						id="connect:nick"
						v-model="defaults.nick"
						class="input nick"
						name="nick"
						pattern="[^\s:!@]+"
						maxlength="100"
						required
						@input="onNickChanged"
					/>
				</div>
				<template v-if="!config.useHexIp">
					<div class="connect-row">
						<label for="connect:username">Username</label>
						<input
							id="connect:username"
							ref="usernameInput"
							v-model="defaults.username"
							class="input username"
							name="username"
							maxlength="100"
						/>
					</div>
				</template>
				<div class="connect-row">
					<label for="connect:realname">Real name</label>
					<input
						id="connect:realname"
						v-model="defaults.realname"
						class="input"
						name="realname"
						maxlength="300"
					/>
				</div>
			</template>

			<template v-if="$store.state.serverConfiguration.public">
				<template v-if="config.lockNetwork">
					<div class="connect-row">
						<label></label>
						<div class="input-wrap">
							<label class="tls">
								<input v-model="displayPasswordField" type="checkbox" />
								I have a password
							</label>
						</div>
					</div>
					<div v-if="displayPasswordField" class="connect-row">
						<label for="connect:password">Password</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:password"
								ref="publicPassword"
								v-model="defaults.password"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								placeholder="Server password (optional)"
								name="password"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>

			<div>
				<button type="submit" class="btn" :disabled="disabled ? true : false">
					<template v-if="defaults.uuid">Save network</template>
					<template v-else>Connect</template>
				</button>
			</div>
		</form>
	</div>
</template>

<style>
#connect .connect-auth {
	display: block;
	margin-bottom: 10px;
}

#connect .connect-auth .opt {
	display: block;
	width: 100%;
}

#connect .connect-auth input {
	margin: 3px 10px 0 0;
}

#connect .connect-sasl-external {
	padding: 10px;
	border-radius: 2px;
	background-color: #d9edf7;
	color: #31708f;
}

#connect .connect-sasl-external pre {
	margin: 0;
	user-select: text;
}
</style>

<script>
import RevealPassword from "./RevealPassword.vue";
import SidebarToggle from "./SidebarToggle.vue";

export default {
	name: "NetworkForm",
	components: {
		RevealPassword,
		SidebarToggle,
	},
	props: {
		handleSubmit: Function,
		defaults: Object,
		disabled: Boolean,
	},
	data() {
		return {
			config: this.$store.state.serverConfiguration,
			previousUsername: this.defaults.username,
			displayPasswordField: false,
		};
	},
	watch: {
		displayPasswordField(value) {
			if (value) {
				this.$nextTick(() => this.$refs.publicPassword.focus());
			}
		},
		"defaults.commands"() {
			this.$nextTick(this.resizeCommandsInput);
		},
		"defaults.tls"(isSecureChecked) {
			const ports = [6667, 6697];
			const newPort = isSecureChecked ? 0 : 1;

			// If you disable TLS and current port is 6697,
			// set it to 6667, and vice versa
			if (this.defaults.port === ports[newPort]) {
				this.defaults.port = ports[1 - newPort];
			}
		},
	},
	methods: {
		setSaslAuth(type) {
			this.defaults.sasl = type;
		},
		onNickChanged(event) {
			// Username input is not available when useHexIp is set
			if (!this.$refs.usernameInput) {
				return;
			}

			if (
				!this.$refs.usernameInput.value ||
				this.$refs.usernameInput.value === this.previousUsername
			) {
				this.$refs.usernameInput.value = event.target.value;
			}

			this.previousUsername = event.target.value;
		},
		onSubmit(event) {
			const formData = new FormData(event.target);
			const data = {};

			for (const item of formData.entries()) {
				data[item[0]] = item[1];
			}

			this.handleSubmit(data);
		},
		resizeCommandsInput() {
			if (!this.$refs.commandsInput) {
				return;
			}

			// Reset height first so it can down size
			this.$refs.commandsInput.style.height = "";

			// 2 pixels to account for the border
			this.$refs.commandsInput.style.height =
				Math.ceil(this.$refs.commandsInput.scrollHeight + 2) + "px";
		},
	},
};
</script>
