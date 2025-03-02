import discord
from discord.ext import commands
from discord_slash import SlashCommand
import yt_dlp
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os

# Load environment variables
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = os.getenv("GUILD_ID")
SPOTIPY_CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
SPOTIPY_CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)
slash = SlashCommand(bot, sync_commands=True)

# Spotify API Setup
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET))

# Slash command for YouTube
@slash.slash(name="youtube", description="Download a YouTube video")
async def youtube(ctx, url: str):
    try:
        ydl_opts = {
            'format': 'best',
            'outtmpl': './downloads/%(title)s.%(ext)s',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            await ctx.send(f"Downloaded {info_dict['title']} successfully!")
    except Exception as e:
        await ctx.send(f"An error occurred: {str(e)}")

# Slash command for Spotify
@slash.slash(name="spotify", description="Get Spotify song details")
async def spotify(ctx, url: str):
    try:
        track_id = url.split("/")[-1].split("?")[0]
        track = sp.track(track_id)
        await ctx.send(f"**{track['name']}** by {', '.join(artist['name'] for artist in track['artists'])}")
    except Exception as e:
        await ctx.send(f"An error occurred: {str(e)}")

# Run the bot
bot.run(DISCORD_TOKEN)
