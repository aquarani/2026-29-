const DB = {
  getParticipants {
    return JSON.parse(localStorage.getItem('participants') || '[]');
  },
  addParticipant(p) {
    const list = this.getParticipants;
    list.push(p);
    localStorage.setItem('participants', JSON.stringify(list));
  },
  getCheckins {
    return JSON.parse(localStorage.getItem('checkins') || '[]');
  },
  addCheckin(c) {
    const list = this.getCheckins;
    list.push(c);
    localStorage.setItem('checkins', JSON.stringify(list));
  },
  findParticipant(id) {
    return this.getParticipants.find(p => p.id === id);
  },
  isCheckedIn(id) {
    return this.getCheckins.some(c => c.participantId === id);
  }
};