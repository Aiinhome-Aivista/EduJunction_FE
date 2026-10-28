const DEFAULT_AVATARS = ['👦', '👧', '🧑‍🎓', '👱', '🧒', '👶', '👩‍🎓', '👨‍🎓'];

export const getCleanAvatar = (avatar?: string | null, nameOrId?: string | number): string => {
  if (avatar && avatar !== '?' && avatar !== '??' && avatar.trim() !== '') {
    return avatar;
  }
  if (nameOrId !== undefined && nameOrId !== null) {
    const str = String(nameOrId);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    const idx = Math.abs(hash) % DEFAULT_AVATARS.length;
    return DEFAULT_AVATARS[idx];
  }
  return '👦';
};

