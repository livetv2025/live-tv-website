document.addEventListener("DOMContentLoaded", () => {
    const channelList = document.getElementById("channel-list");
    const placeholderMessage = document.getElementById("placeholder-message");

    // Handle M3U Import
    document.getElementById("import-m3u").addEventListener("click", async () => {
        const playlistUrl = document.getElementById("playlist-url").value;
        if (!playlistUrl) return alert("Please enter a valid M3U URL");

        try {
            const response = await fetch(playlistUrl);
            const m3uText = await response.text();
            const channels = parseM3U(m3uText);
            displayChannels(channels);
        } catch (error) {
            console.error("Error importing M3U:", error);
            alert("Failed to load M3U playlist.");
        }
    });

    // Handle Xtream Codes Import
    document.getElementById("import-xtream").addEventListener("click", async () => {
        const url = document.getElementById("xtream-url").value;
        const username = document.getElementById("xtream-username").value;
        const password = document.getElementById("xtream-password").value;
        if (!url || !username || !password) return alert("Please fill all Xtream Codes fields.");

        try {
            const response = await fetch(`${url}/player_api.php?username=${username}&password=${password}`);
            const data = await response.json();
            const channels = data.live || [];
            displayChannels(channels.map(channel => ({
                name: channel.name,
                logo: channel.stream_icon || "assets/images/default-logo.png",
                link: `${url}/live/${username}/${password}/${channel.stream_id}.m3u8`
            })));
        } catch (error) {
            console.error("Error importing Xtream Codes:", error);
            alert("Failed to load Xtream Codes playlist.");
        }
    });

    // Parse M3U File
    function parseM3U(m3uText) {
        const lines = m3uText.split("\n");
        const channels = [];
        let currentChannel = {};

        lines.forEach(line => {
            if (line.startsWith("#EXTINF")) {
                const [, info] = line.split("#EXTINF:");
                const [metadata, name] = info.split(",");
                currentChannel.name = name;
                const logoMatch = metadata.match(/tvg-logo="(.*?)"/);
                currentChannel.logo = logoMatch ? logoMatch[1] : "assets/images/default-logo.png";
            } else if (line.startsWith("http")) {
                currentChannel.link = line.trim();
                channels.push({ ...currentChannel });
                currentChannel = {};
            }
        });

        return channels;
    }

    // Display Channels
    function displayChannels(channels) {
        placeholderMessage.style.display = "none";
        channelList.innerHTML = "";
        channels.forEach(channel => {
            const channelCard = document.createElement("div");
            channelCard.className = "channel-card";
            channelCard.innerHTML = `
                <img src="${channel.logo}" alt="${channel.name}">
                <h3>${channel.name}</h3>
                <a href="${channel.link}" target="_blank">Watch Now</a>
            `;
            channelList.appendChild(channelCard);
        });
    }
});
