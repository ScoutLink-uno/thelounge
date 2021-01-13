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
					<img src="img/sl-badge.png" alt="ScoutLink Badge" />
					Welcome to ScoutLink Webchat
				</template>
			</h1>
			<p>
				Type a nickname in the nick box below and click connect to instantly chat to Scouts
				and Guides from around the world!
			</p>

			<p>
				<b>Disclaimer</b>: By connecting to ScoutLink you confirm you have read and agree to
				follow our <a href="https://scoutlink.net/rules">Rules</a> and
				<a href="https://scoutlink.net/safety">Safety</a> information.
			</p>
			<p
				style="
					background-color: rgb(223, 240, 216);
					color: rgb(60, 118, 61);
					padding: 10px;
					border-radius: 2px;
					margin-top: 20px;
				"
			>
				This is a modified version by Yorick. For the official ScoutLink Webchat, visit
				https://webchat.scoutlink.net
			</p>

			<template v-if="config.displayNetwork">
				<h2>Connect</h2>
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
				<label for="connect:nick">Nickname</label>
				<input
					id="connect:nick"
					v-model="defaults.nick"
					class="input nick"
					name="nick"
					pattern="[^\s:!@]+"
					value=""
					maxlength="100"
					required
					@input="onNickChanged"
				/>
				<input
					id="connect:realname"
					type="hidden"
					class="input"
					name="realname"
					:value="defaults.realname"
					maxlength="300"
				/>
			</div>
			<template v-if="!config.useHexIp">
				<div class="connect-row">
					<input
						id="connect:username"
						ref="usernameInput"
						v-model="defaults.username"
						type="hidden"
						class="input username"
						name="username"
						maxlength="100"
					/>
				</div>
			</template>

			<template v-if="defaults.uuid && !$store.state.serverConfiguration.public">
				<div class="connect-row">
					<label for="connect:commands">
						Commands
						<span
							class="tooltipped tooltipped-ne tooltipped-no-delay"
							aria-label="One /command per line.
Each command will be executed in
the server tab on new connection"
						>
							<button class="extra-help" />
						</span>
					</label>
					<textarea
						id="connect:commands"
						ref="commandsInput"
						:value="defaults.commands ? defaults.commands.join('\n') : ''"
						class="input"
						name="commands"
						@input="resizeCommandsInput"
					/>
				</div>
			</template>

			<template v-if="defaults.join !== ''">
				<div class="connect-row">
					<label for="connect:channels">Channels</label>
					<input
						id="connect:channels"
						v-model="defaults.join"
						class="input"
						name="join"
					/>
					<a class="change_channel" href="https://webchat.scoutlink.net">Edit</a>
				</div>
			</template>
			<template v-if="defaults.join == ''">
				<div class="connect-row">
					<label for="connect:channels">Channels</label>
					<select id="connect:channels" class="input" name="join">
						<optgroup label="Defaults">
							<option value="#english">English</option>
							<option value="#help">Help</option>
						</optgroup>
						<optgroup label="Regional">
							<option value="#arabics">Arabics</option>
							<option value="#chinese">Chinese</option>
							<option value="#dansk">Dansk</option>
							<option value="#deutsch">Deutsch</option>
							<option value="#dutch">Dutch</option>
							<option value="#english">English</option>
							<option value="#espanol">Espanol</option>
							<option value="#esperanto">Esperanto</option>
							<option value="#francais">Francais</option>
							<option value="#greek">Greek</option>
							<option value="#indonesian">Indonesian</option>
							<option value="#italiano">Italiano</option>
							<option value="#malay">Malay</option>
							<option value="#norsk">Norsk</option>
							<option value="#polish">Polish</option>
							<option value="#portugues">Portugues</option>
							<option value="#scandinavia">Scandinavia</option>
							<option value="#suomi">Suomi</option>
							<option value="#svenska">Svenska</option>
						</optgroup>
						<optgroup label="Age Specific">
							<option value="#leaders">Leaders (for adult Leaders/volunteers)</option>
							<option value="#youth">Youth (for youth members aged 14+)</option>
						</optgroup>
						<optgroup label="Special Events">
							<option value="#radioscout">Radio Scout</option>
							<option value="#trefoil">Trefoil - Girl Guiding/Scouting</option>
						</optgroup>
						<optgroup label="Games">
							<option value="#minecraft">Minecraft</option>
							<option value="#uno">Uno</option>
							<option value="#werewolf">Werewolf</option>
							<option value="#trivia">Trivia</option>
							<option value="#dutch-quiz">Dutch Quiz</option>
							<option value="#dutch-uno">Dutch Uno</option>
							<option value="#dutch-weerwolven">Dutch Werewolf</option>
							<option value="#scandinavia-uno">Scandinavia Uno</option>
						</optgroup>
						<optgroup label="Miscellaneous">
							<option value="">Do not join a channel</option>
						</optgroup>
					</select>
				</div>
			</template>

			<template v-if="$store.state.serverConfiguration.public">
				<template v-if="config.lockNetwork">
					<div class="connect-row">
						<label></label>
						<div class="input-wrap">
							<label class="tls">
								<input v-model="displayPasswordField" type="checkbox" />
								I have a NickServ password
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
								placeholder="NickServ password (optional)"
								name="password"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>
			<template v-else>
				<h2 id="label-auth">Authentication</h2>
				<div class="connect-row connect-auth" role="group" aria-labelledby="label-auth">
					<label class="opt">
						<input
							:checked="!defaults.sasl"
							type="radio"
							name="sasl"
							value=""
							@change="setSaslAuth('')"
						/>
						No authentication
					</label>
					<label class="opt">
						<input
							:checked="defaults.sasl === 'plain'"
							type="radio"
							name="sasl"
							value="plain"
							@change="setSaslAuth('plain')"
						/>
						Username + password (SASL PLAIN)
					</label>
					<label
						v-if="!$store.state.serverConfiguration.public && defaults.tls"
						class="opt"
					>
						<input
							:checked="defaults.sasl === 'external'"
							type="radio"
							name="sasl"
							value="external"
							@change="setSaslAuth('external')"
						/>
						Client certificate (SASL EXTERNAL)
					</label>
				</div>

				<template v-if="defaults.sasl === 'plain'">
					<div class="connect-row">
						<label for="connect:username">Account</label>
						<input
							id="connect:saslAccount"
							v-model="defaults.saslAccount"
							class="input"
							name="saslAccount"
							maxlength="100"
							required
						/>
					</div>
					<div class="connect-row">
						<label for="connect:password">Password</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:saslPassword"
								v-model="defaults.saslPassword"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								name="saslPassword"
								maxlength="300"
								required
							/>
						</RevealPassword>
					</div>
				</template>
				<div v-else-if="defaults.sasl === 'external'" class="connect-sasl-external">
					<p>The Lounge automatically generates and manages the client certificate.</p>
					<p>
						On the IRC server, you will need to tell the services to attach the
						certificate fingerprint (certfp) to your account, for example:
					</p>
					<pre><code>/msg NickServ CERT ADD</code></pre>
				</div>
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

.change_channel {
	border: 2px solid var(--button-color);
	border-radius: 3px;
	color: var(--button-color);
	display: inline-block;
	font-size: 12px;
	font-weight: bold;
	letter-spacing: 1px;
	margin-bottom: 10px;
	padding: 9px 17px;
	text-transform: uppercase;
	transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
	word-spacing: 3px;
	cursor: pointer; /* This is useful for `<button>` elements */
	margin-left: 10px;
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
