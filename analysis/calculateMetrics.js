// Função para calcular o tempo médio por página
const calculateAverageTimePerPage = (logs) => {
  const pageTimes = {};
  logs.forEach((log, index) => {
    const { id_usuario, acao: page, timestamp } = log;
    if (!page || !timestamp) return;
    const currentTimestamp = new Date(timestamp).getTime();
    const nextLog = logs[index + 1];
    if (!nextLog || nextLog.id_usuario !== id_usuario) return;
    const nextTimestamp = nextLog.timestamp ? new Date(nextLog.timestamp).getTime() : null;
    if (!currentTimestamp || !nextTimestamp || currentTimestamp >= nextTimestamp) return;

    const timeSpent = nextTimestamp - currentTimestamp;
    if (!pageTimes[page]) {
      pageTimes[page] = { totalTime: 0, count: 0 };
    }
    pageTimes[page].totalTime += timeSpent;
    pageTimes[page].count += 1;
  });

  return Object.entries(pageTimes).map(([page, data]) => ({
    page,
    averageTime: data.count > 0 ? (data.totalTime / data.count) / 60000 : null, // Milissegundos para minutos
  }));
};

// Função para calcular picos de uso
const calculateUsagePeaks = (logs) => {
  const hourlyLogs = logs.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const peakHour = Object.keys(hourlyLogs).reduce((peak, hour) =>
    hourlyLogs[hour] > hourlyLogs[peak] ? hour : peak
  );

  return [{ hour: peakHour, count: hourlyLogs[peakHour], hours: Object.entries(hourlyLogs) }];
};

// Função para calcular padrões de navegação
const calculateNavigationPatterns = (logs) => {
  const patterns = {};

  logs.forEach((log) => {
    const { id_usuario: user, acao: page, timestamp } = log;
    if (!user || !page || !timestamp) return;

    if (!patterns[user]) {
      patterns[user] = [];
    }

    patterns[user].push({ page, timestamp });
  });

  return Object.entries(patterns).map(([user, pattern]) => ({
    user,
    pattern: pattern.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)), // Ordenar por timestamp
  }));
};

// Exportar todas as funções
module.exports = {
  calculateAverageTimePerPage,
  calculateUsagePeaks,
  calculateNavigationPatterns,
};
