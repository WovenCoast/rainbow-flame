import { User, GuildMember, Role } from "discord.js";
import { Repository } from "typeorm";
import { Mute } from "../../models/Mute";

export default {
  async mute(
    muteRepo: Repository<Mute>,
    {
      member,
      moderator,
      reason,
    }: {
      member: GuildMember;
      moderator: User;
      reason: string;
    }
  ) {
    let muteRole: Role = member.guild.roles.cache.find(
      (r) => r.name === "Muted"
    );
    if (!muteRole) {
      muteRole = await member.guild.roles.create({
        data: {
          color: "GREY",
          hoist: false,
          mentionable: false,
          name: "Muted",
          permissions: [],
        },
        reason: `Muted role doesn't exist`,
      });
      await Promise.all(
        member.guild.channels.cache.map(async (channel) => {
          return await channel
            .overwritePermissions([
              {
                id: muteRole,
                deny: ["ADD_REACTIONS", "SEND_MESSAGES", "SPEAK"],
              },
            ])
            .catch((e) => null);
        })
      );
    }
    await member.roles.add(muteRole);
    await muteRepo.insert({
      guild: member.guild.id,
      moderator: moderator.id,
      active: true,
      reason,
      time: Date.now(),
      user: member.user.id,
    });
  },
  async unmute(
    muteRepo: Repository<Mute>,
    { member, reason }: { member: GuildMember; reason: string }
  ) {
    const mute: Mute = (
      await muteRepo.find({
        guild: member.guild.id,
        user: member.user.id,
        active: true,
      })
    )[0];
    if (!mute || !mute.active) return;
    mute.active = false;
    mute.end = Date.now();
    mute.reason =
      mute.reason === reason
        ? mute.reason
        : mute.reason + `, unmuted because ${reason}`;
    await muteRepo.update(
      { guild: member.guild.id, user: member.user.id, active: true },
      mute
    );
    const muteRole: Role = member.guild.roles.cache.find(
      (r) => r.name === "Muted"
    );
    await member.roles.remove(muteRole);
  },
};
