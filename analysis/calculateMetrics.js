// calculateMetrics.js

const calculateAverageTimePerPage = (logs) => {
  const pageTimes = {};

  logs.forEach((log, index) => {
    const { id_usuario, acao: page, timestamp } = log;
    
    if (!page || !timestamp) return; // Verifica se há página e timestamp

    const currentTimestamp = new Date(timestamp).getTime();
    const nextLog = logs[index + 1];

    // Verificar se existe um próximo log antes de tentar acessá-lo
    if (!nextLog || !nextLog.timestamp) return;

    const nextTimestamp = new Date(nextLog.timestamp).getTime();

    // Verificar validade dos timestamps
    if (!currentTimestamp || !nextTimestamp || currentTimestamp >= nextTimestamp) {
      return;
    }
    
    // Calcular o tempo gasto entre os logs
    let timeSpent = nextTimestamp - currentTimestamp;

    // Verificar se o tempo é realista (não mais do que, digamos, 1 hora em milissegundos)
    if (timeSpent > 3600000) {  // 1 hora em milissegundos
      console.log(`Tempo absurdo entre logs detectado: ${timeSpent}ms`);
      return;
    }

    if (!pageTimes[page]) {
      pageTimes[page] = { totalTime: 0, count: 0 };
    }
    
    pageTimes[page].totalTime += timeSpent;
    pageTimes[page].count += 1;
  });

  // Calcula o tempo médio por página
  return Object.entries(pageTimes).map(([page, data]) => ({
    page,
    averageTime: data.count > 0 ? data.totalTime / data.count : null,
  }));
};



// Função para calcular picos de uso
function calculateUsagePeaks(logs) {
  // Implemente a lógica para identificar picos de uso
  // Exemplo simplificado:
  const hourlyLogs = logs.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const peakHour = Object.keys(hourlyLogs).reduce((peak, hour) =>
    hourlyLogs[hour] > hourlyLogs[peak] ? hour : peak
  );

  return [{ hour: peakHour, count: hourlyLogs[peakHour] }];
}

// Exportar as funções
module.exports = {
  calculateAverageTimePerPage,
  calculateUsagePeaks,
};
