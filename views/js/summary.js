document.addEventListener('DOMContentLoaded', () => {
    const evaluationData = <%= JSON.stringify(evaluationSummary) %>;
    const ctx = document.getElementById('evaluationChart').getContext('2d');
    const labels = evaluationData.map(eval => eval.subjectName);
    const ratings = evaluationData.map(eval => eval.averageRating);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Rating',
          data: ratings,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
      }
    });
  });