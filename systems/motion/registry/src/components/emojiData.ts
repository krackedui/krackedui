// A representative subset of the emoji set the picker shows (emoji-picker capture: "Callout" row is the
// recommended set for callouts; then Unicode categories). Not exhaustive by design.
export interface EmojiCategory { id: string; label: string; icon: string; emoji: string[] }

const split = (s: string) => s.trim().split(/\s+/);

export const emojiCategories: EmojiCategory[] = [
  { id: 'callout', label: 'Callout', icon: 'clock', emoji: split('💡 👉 ☝️ 👌 🔑 🚧 ⚠️ 🔥 📌 ✂️ ❓ 🚫 ⛔ ⏰ ☎️ 🚨 ♻️ ✅ 🔒 📎 📖 🗣️ ➡️ 📢 🛠️ ⚙️') },
  { id: 'people', label: 'People', icon: 'emojiFace', emoji: split('😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 👋 🤚 🖐️ ✋ 🖖 👍 👎 👏 🙌 🙏 💪') },
  { id: 'nature', label: 'Animals & Nature', icon: 'leaf', emoji: split('🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🐺 🐴 🦄 🐝 🦋 🐌 🐞 🐢 🐍 🐙 🐬 🐳 🦈 🌵 🌲 🌳 🌴 🌱 🌿 🍀 🍁 🍂 🌷 🌹 🌻 🌸 🌼 🌙 ⭐ 🌈 ☀️ ⛅ ❄️ 🌊') },
  { id: 'food', label: 'Food & Drink', icon: 'carrot', emoji: split('🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥦 🥕 🌽 🌶️ 🥐 🍞 🧀 🥚 🍳 🥞 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🍝 🍜 🍣 🍱 🍩 🍪 🎂 🍰 🍫 🍿 ☕ 🍵 🧃 🍺 🍷') },
  { id: 'activity', label: 'Activities', icon: 'soccerBall', emoji: split('⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🎯 ⛳ 🎣 🎿 🏂 🏋️ 🚴 🏊 🧘 🏆 🥇 🥈 🥉 🎖️ 🎫 🎟️ 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 ♟️ 🎮 🧩') },
  { id: 'travel', label: 'Travel & Places', icon: 'airplane', emoji: split('🚗 🚕 🚙 🚌 🏎️ 🚓 🚑 🚒 🚚 🚲 🛵 🏍️ 🚨 🚃 🚄 🚅 🚂 ✈️ 🛫 🛬 🚀 🛸 🚁 ⛵ 🚤 🚢 ⚓ 🗺️ 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 ⛲ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🏕️ 🏠 🏡 🏢 🏬 🏫 🏥 🏦 ⛪ 🌃 🌆 🌅') },
  { id: 'objects', label: 'Objects', icon: 'lightBulbBright', emoji: split('⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💾 💿 📷 🎥 📺 📻 🎙️ ⏱️ ⏰ 🕰️ ⌛ 🔋 🔌 💡 🔦 🕯️ 💸 💵 💰 💳 💎 ⚖️ 🧰 🔧 🔨 ⚒️ 🛠️ ⛏️ 🔩 ⚙️ 🧲 🔫 💣 🔪 🛡️ 🔮 💊 💉 🧪 🌡️ 🧹 🧺 🧻 🛁 🔑 🗝️ 🚪 🛋️ 🛏️ 🧸 🎁 🎈 🎉 ✉️ 📦 📫 📝 📁 📂 📅 📆 📇 📈 📉 📊 📋 📌 📍 📎 📏 📐 ✂️ 🗃️ 🗄️ 🗑️ 🔒 🔓 🔏 🔐 📚 📖 🔖 🏷️') },
  { id: 'symbols', label: 'Symbols', icon: 'checkmarkCircle', emoji: split('❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💯 💢 💥 💫 💦 💬 💭 🗯️ ♻️ ✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ➗ ✖️ ♾️ ‼️ ⁉️ ❓ ❔ ❕ ❗ 〰️ ⚠️ 🚸 🔱 ⚜️ 🔰 ⭕ 🛑 ⛔ 📛 🚫 🔞 📵 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ 🔀 🔁 🔂 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ 🔄 #️⃣ *️⃣ 0️⃣ 1️⃣ 2️⃣ 3️⃣ 🆗 🆕 🆒 🆓 ℹ️ 🔤') },
  { id: 'flags', label: 'Flags', icon: 'flag', emoji: split('🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏴‍☠️ 🇺🇸 🇬🇧 🇨🇦 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇵🇹 🇳🇱 🇧🇪 🇨🇭 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇮🇪 🇯🇵 🇰🇷 🇨🇳 🇮🇳 🇧🇷 🇲🇽 🇦🇷 🇿🇦 🇳🇬 🇰🇪 🇷🇼 🇪🇬 🇦🇺 🇳🇿') },
];
